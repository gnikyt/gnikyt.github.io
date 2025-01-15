---
layout: post
title: ActiveRecord and Liquid Drops with Sinatra
permalink: activerecord-and-liquid-drops-with-sinatra
date: '2015-10-15 02:00:00'
---

Normally I use ERB when doing templates but there was a special use-case recently where I needed to allow the app user to modify a specific template. [Liquid templates](http://liquidmarkup.org/) (what Jekyll and Shopify use) was perfect for this situation because it has a simple syntax for anyone to pick up and it's also safe due to its scope limited to what's passed to the template.

Let's suppose you have two models in your Sinatra application -- `Student` and `Book`.

```ruby
# app/models/student_model.rb
module MyApp
  module Model
    class Student
      has_many :books
    end
  end
end

# app/models/book_model.rb
module MyApp
  module Model
    class Book
      belongs_to :student
    end
  end
end
```

Now, Liquid has what they call a [Drop](https://github.com/Shopify/liquid/wiki/Introduction-to-Drops), where you can easily build a plain class which Liquid can then use directly when rendering the template. As the [Drop Introduction](https://github.com/Shopify/liquid/wiki/Introduction-to-Drops) states, it acts "like" a hash so the methods you create can be accessed with dot-notation in the template. Example: `{% raw %}{{ student.full_name }}{% endraw %}`

So let's create a `Student` drop and a `Book` drop and give the templates some basic variables from the model to access.

```ruby
# app/drops/student_drop.rb
module MyApp
  module Drop
    class Student
      def initialize(student)
        @student = student
      end
      
      def full_name
        "#{@student.first_name} {@student.last_name}"
      end
      
      def allergies
        @student.allergies.split ','
      end
      
      def books
        @student.books
      end
    end
  end
end

# app/drops/book_drop.rb
module MyApp
  module Drop
    class Book
      def initialize(book)
        @book = book
      end

      def title
        @book.title
      end
      
      def barcode
        @book.barcode
      end
      
      def date_printed
        @book.date_printed
      end
    end
  end
end
```

Ok so now we have our models and drops setup. As you can see above we've set up methods for accessing the student's name, their books, the book title, barcode, etc. All of these methods can be used in a Liquid template now.

But now, how do we easily combine the two? Easy, we utilize `to_liquid` method by adding it to our model which Liquid calls when rendering the template. We then return the proper drop for the model inside the new `to_liquid` method.

```ruby
# app/models/student_model.rb
module MyApp
  module Model
    class Student
      has_many :books
      
      def to_liquid
        Drop::Student.new self
      end
    end
  end
end

# app/models/book_model.rb
module MyApp
  module Model
    class Book
      belongs_to :student
      
      def to_liquid
        Drop::Book.new self
      end
    end
  end
end
```

That's pretty much it. We've now:

1. Created our models
2. Created our drops
3. Modified our models to return a drop

With all this combined we can then use it all together as such:

```ruby
# app/controllers/front_controller.rb
...
student = Model::Student.find params[:id]
liquid :'front/test', layout: :layout_front, locals: {'student' => student}
```

```erb
{% raw %}
# app/views/front/test.liquid
My name is {{ student.full_name }}. I have {{ student.books.size }} books!
{% endraw %}
```

That's it for this little how-to. I will note there are other ways to expose your ActiveRecord models to work automatically with Liquid but this article just shows you a more expanded and controlled version.
