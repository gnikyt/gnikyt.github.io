---
layout: post
title: Shopify value objects for Go, v2
permalink: shopify-value-objects-go-v2
date: '2026-10-13 12:00:00'
category: golang
---

The first version of this package did what it needed to do: one common shape for GIDs, validation, conversions, equality, and JSON support. The problem was what it cost to add a new resource.

In v1, every GID type was its own hand-written implementation. `CustomerID`, `ProductID`, `VariantID`, `OrderID`, `InventoryItem`, etc — each one was roughly 40 lines of the same methods with the type name swapped: `ID()`, `String()`, `Equal()`, `IsValid()`, `MarshalJSON()`, `UnmarshalJSON()`, plus a slice type, two converters, and two constructors. On top of that, adding a type meant updating the `Identifiers` union and the `typeFrom()` switch. It was copy-paste work, and copy-paste work is where mistakes live.

v2 gets rid of all of that. There is one generic implementation, and a new resource is a name.

## Implementation

The whole package is now built on a single generic type:

```go
package gid

// ...

// kind defined a Shopify GID resource name.
// The name is the resource segment of a GID: "gid://shopify/<Name>/<ID>".
type kind interface {
	name() string
}

// GID is a Shopify GID resource of kind K.
type GID[K kind] int64

// ...
```

Every method is implemented once, on `GID[K]`:

```go
// ID returns the numeric portion of the GID.
func (g GID[K]) ID() int64 {
	return int64(g)
}

// String returns the full GID, such as "gid://shopify/Customer/123".
func (g GID[K]) String() string {
	var k K
	return fmt.Sprintf("gid://shopify/%s/%d", k.name(), int64(g))
}

// IsValid reports whether the GID refers to a real resource.
func (g GID[K]) IsValid() bool {
	return g > 0
}

// Equal reports whether two GIDs of the same kind are equal.
func (g GID[K]) Equal(other GID[K]) bool {
	return g == other
}

// ...
```

A few things changed along the way:

* `Equal()` now takes a `GID[K]`, so comparing a `CustomerID` to an `OrderID` is a compile error instead of a runtime `false`. In v1 it accepted any `Identifier` and sorted it out with a type assertion.
* The backing type is `int64` instead of `int`.
* Float inputs are gone — `parse` accepts `int`, `int64`, and strings.
* Parsing is stricter: a full GID must split into exactly five parts, and the `gid:` and `shopify` segments are checked, not just the type and ID.

```go
func parseString[K kind](s string) (GID[K], error) {
	// Bare numeric string: "123456789".
	if id, err := strconv.ParseInt(s, 10, 64); err == nil {
		return GID[K](id), nil
	}

	// Full GID: "gid://shopify/<name>/<id>" splits into exactly five parts.
	parts := strings.Split(s, "/")
	if len(parts) != 5 || parts[0] != "gid:" || parts[2] != "shopify" {
		return 0, fmt.Errorf("gid: malformed GID %q", s)
	}

	var k K
	if want := k.name(); parts[3] != want {
		return 0, fmt.Errorf("gid: expected kind %s, got %s", want, parts[3])
	}

	id, err := strconv.ParseInt(parts[4], 10, 64)
	if err != nil {
		return 0, fmt.Errorf("gid: invalid id in %q", s)
	}
	return GID[K](id), nil
}
```

Construction is generic too:

```go
// New creates a GID from a value, ignoring any parse error (the zero value is
// returned on failure).
func New[K kind](val any) GID[K] {
	g, _ := parse[K](val)
	return g
}

// NewValidated creates a GID from a value and returns an error if the value is
// malformed, of the wrong kind, or does not refer to a real resource.
func NewValidated[K kind](val any) (GID[K], error) {
	g, err := parse[K](val)
	if err != nil {
		return g, err
	}
	if !g.IsValid() {
		return g, fmt.Errorf("gid: invalid value: %v", val)
	}
	return g, nil
}
```

## Adding a new resource

This is the entire implementation for a Customer:

```go
// customerKind marks a GID as a Shopify Customer.
type customerKind struct{}

func (customerKind) name() string {
	return "Customer"
}

type (
	// CustomerID is the GID of a Shopify Customer.
	CustomerID = GID[customerKind]

	// CustomerIDs is a slice of CustomerID.
	CustomerIDs []CustomerID
)

func (cids CustomerIDs) ToIDs() []int64 {
	return ToIDs(cids)
}
func (cids CustomerIDs) ToStrings() []string {
	return ToStrings(cids)
}

// NewCustomerID creates a new CustomerID from a value.
func NewCustomerID(val any) CustomerID {
	return New[customerKind](val)
}

// NewCustomerIDValidated creates a new CustomerID from a value and validates it.
func NewCustomerIDValidated(val any) (CustomerID, error) {
	return NewValidated[customerKind](val)
}
```

No `Identifiers` union to update, no `typeFrom()` switch, no hand-written methods. The kind is a name; everything else comes from `GID[K]`.

## API

The public API is unchanged from v1, so existing code keeps working. Construction goes through the per-type constructors — `kind` is unexported, so the generic `New`/`NewValidated` are internal.

### Init without validation

How to create and access information of the object.

These methods do not return an error for bad objects, it will return an object with a zero value instead. If you need validation, refer to validation section below this.

```go
cid := gid.NewCustomerID("gid://shopify/Customer/12345") // Accepts GID or ID.
cid.ID() // 12345
cid.String() // gid://shopify/Customer/12345
cid.IsValid() // true

oid := gid.NewOrderID(478848)
oid.ID() // 478848
oid.String() // gid://shopify/Order/478848
oid.IsValid() // true

// No error reported, but zero-value object returned.
pid := gid.NewProductID("gid://shopify/Whoops/1234")
pid.IsValid() // false
```

### Init with validation

All `New{X}ID` methods support validation by appending `Validated`.

These methods will return an error and the object will be zero value.

```go
cid, err := gid.NewCustomerIDValidated("whoops")
// err = "gid: malformed GID \"whoops\""
cid.IsValid() // false
```

### Comparisons

How to compare two objects.

```go
cid := gid.NewCustomerID("gid://shopify/Customer/12345")
cid2 := gid.NewCustomerID("gid://shopify/Customer/123456")
fmt.Printf("Same? %v", cid.Equal(cid2)) // Same? false.
fmt.Printf("Same? %v", cid.Equal(cid)) // Same? true.
```

Comparing across kinds, e.g. a CustomerID against an OrderID, does not compile.

### Slice supports

All built-in objects also have slices such as `ProductIDs`, `OrderIDs`, etc. to do things like convert all objects to their IDs or all objects to their GID.

```go
pids := gid.ProductIDs{
    gid.ProductID(1),
    gid.ProductID(2),
    gid.NewProductID("gid://shopify/Product/5"),
}
pids.ToIDs() // [1, 2, 5]
pids.ToStrings() // [gid://shopify/Product/1, gid://shopify/Product/2, gid://shopify/Product/5]

// Generic versions.
gid.ToIDs([]gid.CustomerID{
    gid.CustomerID(1),
    gid.NewCustomerID("gid://shopify/Customer/5"),
}) // [1, 5]
gid.ToStrings([]gid.CustomerID{
    gid.CustomerID(1),
    gid.NewCustomerID("gid://shopify/Customer/5"),
})  // [gid://shopify/Customer/1, gid://shopify/Customer/5]
```

### Marshalling/Unmarshalling

Automatic support for marshalling to JSON and from a struct into the value object type.

```go
type something struct {
   OrderID gid.OrderID `json:"order_id"`
   // ...
}
```

* If Unmarshalled, `order_id` will be cased to a `OrderID` value object.
* If Marshalled, `order_id` will be turned into `gid://shopify/Order/{id}`.

You can pass around the value objects and utilize them too:

```go
func SomeFunc(open bool, productID gid.ProductID) {
    // ...
}
sm := SomeFunc(true, gid.ProductID(129292))
```

You can view the package snippet [here on Github](https://github.com/gnikyt/shopify-go-value-objects).
