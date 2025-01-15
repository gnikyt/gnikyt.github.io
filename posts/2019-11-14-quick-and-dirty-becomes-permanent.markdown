---
layout: post
title: When "quick and dirty" becomes permanent
permalink: when-quick-and-dirty-becomes-permanent
date: '2019-11-14 20:37:04'
---

## The Start

You're assigned a backend project to kick-off and setup, great! You know the requirements and goals, so you set off to build the structure and prototype "quick and dirty" code as a proof-of-concept implementation.

Before you know it... you've got the ball rolling on the project and making good headway! Other developers may be introduced to assist, and they pick up right along with you in the development flow. Then, it snowballs.

Eventually, you'll realize your original "quick and dirty" way, is now _"the way"_, and it is going to be tough to correct due to the size or timeline of the project now. Whoops!

My personal opinion from being in this situation of beginning large backend projects: _Do it right once._ It is better to bite the bullet and properly set up the project in a way that's abstract and scalable; even if you have to refactor many times in the early stages, its easier to refactor a couple files/directories compared to dozens.

## What To Do

Sit down and plan out your entire structure and with good ol' pen and paper.

- What type of project is it?
- Do you require a database?
- Will you need caching?
- Models and Entities?
- Response handlers?
- Will you be hitting the database with both reads and writes?
- Will you have complex queries to a database?
- Do you need external file storage?
- Object storage?
- Do you need views or presenters?
- etc...

When you sit back and think about the longer term for the project, it'll help guide your thoughts into _**compartments**_ which will help you mentally map things out for a better start.

## Abstraction & Responsibility

Now, the rest of this article is purely my own opinion from experience. There's usually a good debate on what code should do what, and how much abstraction is needed. Every developer has their own opinion and feelings towards what they view as too much or too little.

In my opinion, back to my previous heading, things should always be compartmentalized and have singular responsibilities. This helps keep code DRY, maintainable, scalable, testable, and even cleaner to look at.

### Interfaces

A lot of new developers are put off from interfaces. They don't exactly see the point of them in their projects, even if they are the sole developer working on it.

Interfaces however can be one of the best keys to success in testability and scalability.

An interface in plain words is a set of rules around how a structure needs to behave; whether that structure is an actual struct, class, method, or so on.

You may think its silly to define an interface for a single class, but that's not the case. It allows you to decouple your dependencies and swap out those dependencies. It allows another developer to know how to define a structure to match that interface so there will be no compatibility issues.

For the sake of using a more common language, PHP, let's take a look at how an interface can be useful with a simple silly example. Of course, this can be done with any other language.

```php
<?php

// src/Services/BundleDirectory.php

use Some\Namespace\Interfaces\DirectoryStorage as IDirectoryStorage;

class BundleDirectory
{
    protected $storage;

    public function __construct(IDirectoryStorage $storage)
    {
        $this->storage = $storage;
    }

    public function fetch(int $bundleType): array
    {
        $result = // Some // actions // here
        return $this->storage->locate($result);
    }
}
```

By type-hinting the constructor to an interface and not to a concrete class, we can pass anything that matches `DirectoryStorage` interface. This **decouples** the implementation.

Now, `DirectoryStorage` interface would define how `locate` method should be. `BundleDirectory` doesn't care about the storage lookup... maybe `locate` pulls from SQLite, or S3, or plain-ol text files. The point is, it just doesn't care, so long as the interface matches and does as it's supposed to.

When you're testing, you can now inject a mock implementation into `BundleDirectory` and test without the need to hit an actual storage container.

Nice right? That's just a very basic example of how an interface can be useful.

### SRP / CQR

_Single Responsibility Principle (SRP)_ is one of the big topics people go back-and-forth on. The debate is around how single, single should be. Many complaints come around the fact that SRP causes _too much_ abstraction and separation.

My thoughts: meh, go nuts! Your code should be in compartments and have a singular job to do and to do that job well.

I love following SRP. Similarly, a sub-practice of SRP is CQR, _Command Query Responsibility,_ which states you should have a separation of reading (Query) and writing (Command) methods.

Tieing this in with interfaces, you can produce code that follows DRY and is clean to look at as well as work with.

Combining both, let's take a look at a file storage cache. In NextCloud, which I use heavily with AWS S3 for a storage backend, it stores the information about the files in the database so it does not have to hit S3 for the information constantly, as well as provide a nice method for metadata.

If we were to build something that followed SRP and CQR, we could create something like this (again using PHP for examples):

```php
<?php

// src/Interfaces/FileQueries.php

use Some/Namespace/Entities/File as FileModel;
use Some/Namespace/Interfaces/Enums/FileTypes;

interface FileQueries
{
    public function getByID(int $id): FileModel;

    public function getAll(): array; // FileModel[]

    public function getByType(string $type = FileTypes::DEFAULT);

    // ....
}

//
// ....
//

// src/Services/Operations/ProcessImageFiles.php

use Some/Namespace/Interfaces/FileQueries as IFileQueries;
use Some/Namesapce/Interfaces/AbstractOperation;

class ProcessImageFiles implements AbstractOperation
{
    protected $query;
    protected $fileType;

    public function __construct(IFileQueries $query, string $fileType)
    {
        $this->query = $query;
        $this->fileType = $fileType;
    }

    public function execute(): array
    {
        $results = [];
        $files = $this->query->getByType($this->fileType);
        foreach ($files as $file) {
            // do something with the files, maybe generate thumbnails for images
            $results[] = // something
        }

        return $results;
    }
}
```

In the above, we define a querier, the _Q_ in _CQR,_ which is an interface. We then have an _operation_ which is a single responsibility class doing one job: to query files of a type, do an operation on those files, and return a result.

We can easily swap out the querier for the operation in testing, it is clean to look at, reusable, scalable, and so on.

Maybe we swap in a querier which provides a Redis-cached version of the data for example; instead of injecting `DatabaseFileQueries` we inject `RedisFileQueries` which still conforms to `FileQueries` interface.

Similarly, for the _C_ in _CQR_, we could define `FileCommand` interface which dictates how to update, destroy, and create a file entity.

### Service Classes

While creating many interfaces, operations, commands, queries, etc may seem disjointed... that's the point, because everything should do one thing and do it right!

That being said, you don't have to reference everything singularly just because you defined it with a singular purpose. You can create a service class to glue the operations, commands, and queries together into a group of common methods.

Maybe its a response handler class for the files... taking a request, using that request to form a query, and providing a response. Maybe it is a plain old class for the files... having a common place to access the files, transform the data, etc.

This allows you to have decoupled code, that have singular responsibilities, but still commonly accessible if need be. This avoids creating god-like classes, just simply using the classes to join bits of logic together. Again, making it testable, DRY, clean, reusable, and so forth.

## Conclusion

I just mainly wanted to drive a point home about proper planning for the long run can have some big payoffs when you compartmentalize your code, give it single responsibilities, and decouple it with interfaces. Quick and dirty can become solid and lasting, no matter the language.

Cheers.
