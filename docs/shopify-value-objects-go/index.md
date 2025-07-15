---
layout: post
title: Shopify Value Objects for Go
permalink: shopify-value-objects-go
date: '2025-07-15 12:16:00'
category: golang
---

An existing project had grown rapidly, resulting in many places where IDs were manually extracted from GIDs or formatted into GIDs without validation and passing the raw values around. To address this, I developed a small internal package with the following goals:

* Provide a common object for GID types such as Customer, Order, Variant, and Product
* Validate GID formatting, ensure the GID type matches expectations, and confirm extracted IDs are valid
* Support conversions between IDs and GIDs in both directions
* Enable equality checks between objects
* Allow for marshalling and unmarshalling

To start off, I created an interface for the objects and a list of available types:

```go
package gid

// ...

// Identifiers represents a set of GID types.
type Identifiers interface {
	CustomerID | ProductID | VariantID | OrderID | InventoryItem
}

// Identifier represents a GID.
type Identifier interface {
	ID() int
	String() string
	Equal(ogid Identifier) bool
	IsValid() bool
}

// ...
```

Now, `Identifier` represents a GID and has the following methods:

* `ID()` to return the ID inside the GID
* `String()` to return the GID string containing the type and ID
* `Equal()` to perform equality checks on two objects
* `IsValid()` to ensure object is valid

Next, added methods to support bulk conversions of GIDs to IDs or vise-verse:

```go
package go

// ...

// ToIDs converts GIDs to their int representation.
func ToIDs[T Identifiers](gids []T) []int {
	ids := make([]int, len(gids))
	for i, gid := range gids {
		ids[i] = Identifier(gid).ID()
	}
	return ids
}

// ToStrings converts GIDs to their string representation.
func ToStrings[T Identifiers](gids []T) []string {
	strs := make([]string, len(gids))
	for i, gid := range gids {
		strs[i] = Identifier(gid).String()
	}
	return strs
}

// ...
```

With the foundation established, I started to implement creation methods for the value objects.

```go
package gid

// ...

// typeFrom returns the type name for a given GID type.
func typeFrom[T Identifiers]() string {
	switch any(*new(T)).(type) {
	case CustomerID:
		return "Customer"
	case ProductID:
		return "Product"
	case VariantID:
		return "ProductVariant"
	case OrderID:
		return "Order"
	case InventoryItem:
		return "InventoryItem"
	default:
		return ""
	}
}

// commonNew creates a new GID from a value.
// It supports int64, int, and string formats.
func commonNew[T Identifiers](val any) (T, error) {
	switch v := val.(type) {
	case int64:
		return T(int(v)), nil
	case int:
		return T(int(v)), nil
	case string:
		parts := strings.Split(v, "/")
		if len(parts) < 5 {
			return T(0), fmt.Errorf("invalid GID format: %v", v)
		}
		typ := typeFrom[T]()
		if parts[3] != typ {
			return T(0), fmt.Errorf("expected type %s got %s", typ, parts[3])
		}
		cint, err := strconv.ParseInt(parts[4], 10, 64)
		if err != nil {
			return T(0), fmt.Errorf("invalid ID in GID: %s", v)
		}
		return T(int(cint)), nil
	default:
		return T(0), fmt.Errorf("unsupported type for GID: %T", val)
	}
}

// New creates a new GID from a value.
// It supports int64, int, and string formats.
// For strings, it expects the format "gid://shopify/Type/ID".
// If the value is not recognized, it returns a zero value of the type.
// It ignores errors in validation, for validation use NewValidated.
func New[T Identifiers](val any) T {
	n, _ := commonNew[T](val)
	return n
}

// NewValidated creates a new GID from a value and validates it.
// It returns an error if the GID is not valid.
func NewValidated[T Identifiers](val any) (T, error) {
	gid, err := commonNew[T](val)
	if err != nil {
		return gid, err
	}
	if !Identifier(gid).IsValid() {
		return gid, fmt.Errorf("invalid %T value: %v", gid, val)
	}
	return gid, nil
}

// ...

```

* `commonNew` is a common method used by both `New` and `NewValidated` to create a value object
* `typeFor` is a method to determine the expected type portion of the GID
* `New` is a generic method for creating a value object of a type, without validation
* `NewValidated` is a generic method for creating a value object of a type, with validation

An example implementation utilizing the `Identifier` interface for a value object:

```go
package gid

// CustomerID represents a GID for a Shopify Customer.
type CustomerID int

func (cid CustomerID) ID() int {
	return int(cid)
}

func (cid CustomerID) String() string {
	return fmt.Sprintf("gid://shopify/Customer/%d", cid)
}

func (cid CustomerID) Equal(ocid Identifier) bool {
	if other, ok := ocid.(CustomerID); ok {
		return cid == other
	}
	return false
}

func (cid CustomerID) MarshalJSON() ([]byte, error) {
	return json.Marshal(cid.String())
}

func (cid *CustomerID) UnmarshalJSON(data []byte) error {
	var gid string
	if err := json.Unmarshal(data, &gid); err != nil {
		return err
	}
	*cid = New[CustomerID](gid)
	return nil
}

func (cid CustomerID) IsValid() bool {
	return cid.ID() > 0
}

// CustomerIDs represents a slice of CustomerID.
type CustomerIDs []CustomerID

func (cids CustomerIDs) ToIDs() []int {
	return ToIDs(cids)
}

func (cids CustomerIDs) ToStrings() []string {
	return ToStrings(cids)
}

// NewCustomerID creates a new CustomerID from a value.
func NewCustomerID(val any) CustomerID {
	return New[CustomerID](val)
}

// NewCustomerIDValidated creates a new CustomerID from a value and validates it.
func NewCustomerIDValidated(val any) (CustomerID, error) {
	return NewValidated[CustomerID](val)
}
```

Using the `CustomerID` example above, which is for `gid://shopify/Customer/{id}`, we can do the following:

```go
// Creation.
cid := gid.NewCustomerID(12345) // or gid.NewCustomerID("gid://shopify/Customer/12345")
fmt.Println(cid.ID()) // 12345
fmt.Println(cid.String()) // gid://shopify/Customer/12345
fmt.Printf("Is equal? %v", cid.Equal(CustomerID(123))) // Is Equal? false
fmt.Printf("Is valid? %v", cid.IsValid()) // Is Valid? true

// Slices.
cids := gid.CustomerIDs{gid.NewCustomerID(12345), gid.NewCustomerID("gid://shopify/Customer/54321")}
// or []CustomerID{gid.NewCustomerID(12345), gid.NewCustomerID("gid://shopify/Customer/54321")}
cids.ToIDs() // [12345, 54321]
cids.ToStrings() // [gid://shopify/Customer/12345, gid://shopify/Customer/54321]

// Creation, with validation.
cid, err := gid.NewCustomerIDValidated(12345) // or gid.NewCustomerIDValidated("gid://shopify/Customer/12345")

// Marshalling/Unmarshalling.
type something struct {
   OrderID gid.OrderID `json:"order_id"`
   // ...
}
// If Unmarshalled, order_id will be cased to a OrderID value object.
// If Marshalled, order_id will be turned into `gid://shopify/Order/{id}`.
```

You can view the package snippet [here on Github](https://github.com/gnikyt/shopify-go-value-objects).
