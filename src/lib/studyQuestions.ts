export const quizQuestions = [
  // JavaScript Questions
  {
    question: "Explain event delegation",
    answer:
      "Event delegation is a technique where you add a single event listener to a parent element instead of multiple listeners to individual child elements. It works because events bubble up from the child to the parent, allowing you to handle the event at a higher level.",
  },
  {
    question: "Explain how 'this' works in JavaScript",
    answer:
      "'this' refers to the object that is executing the current function. In a method, 'this' refers to the object owning the method. In a function, 'this' refers to the global object (window in browsers), unless in strict mode, where it is undefined.",
  },
  {
    question: "Explain how prototypal inheritance works",
    answer:
      "Prototypal inheritance allows an object to inherit properties and methods from another object. It works by linking objects through a prototype chain, where each object has a reference to its prototype.",
  },
  {
    question:
      "Why doesn't function foo(){ }(); work as an IIFE? What needs to be changed?",
    answer:
      "function foo(){ }(); doesn't work as an IIFE because the function declaration needs to be enclosed in parentheses to become an expression: (function foo(){ })();.",
  },
  {
    question: "What is an IIFE in JS?",
    answer:
      "An IIFE (Immediately Invoked Function Expression) is a function that runs as soon as it is defined. It is used to create a new scope and avoid polluting the global scope.",
  },
  {
    question:
      "What's the difference between a variable that is: null, undefined or undeclared? How would you check for any of these states?",
    answer:
      "null is an assigned value that means 'no value', undefined means a variable has been declared but not assigned a value, and undeclared means the variable has not been declared at all. You can check with '=== null' for null, '=== undefined' or 'typeof' for undefined, and 'typeof' for undeclared.",
  },
  {
    question: "What is a closure, and how/why would you use one?",
    answer:
      "A closure is a function that remembers its outer variables even after the outer function has finished executing. It is used to create private variables or functions.",
  },
  {
    question:
      "Can you describe the main difference between a .forEach loop and a .map() loop and why you would pick one versus the other?",
    answer:
      ".forEach() executes a function on each array element without returning a new array, while .map() executes a function and returns a new array with the results. Use .map() when you need a new array.",
  },
  {
    question: "What's a typical use case for anonymous functions?",
    answer:
      "Anonymous functions are often used as arguments to other functions or as immediately invoked function expressions (IIFEs).",
  },
  {
    question:
      "How do you organize your code? (module pattern, classical inheritance?)",
    answer:
      "You can organize code using the module pattern to create encapsulated modules, or classical inheritance to create reusable objects using constructor functions.",
  },
  {
    question:
      "What's the difference between host objects and native objects?",
    answer:
      "Host objects are provided by the environment (like browser APIs), while native objects are part of the JavaScript language itself (like Array, Object).",
  },
  {
    question:
      "Difference between: function Person(){}, var person = Person(), and var person = new Person()?",
    answer:
      "function Person(){} is a function declaration. var person = Person() calls the function and assigns its return value to person. var person = new Person() creates a new instance of Person.",
  },
  {
    question: "What's the difference between .call and .apply?",
    answer:
      ".call() and .apply() are used to call a function with a specific 'this' value. .call() takes arguments separately, while .apply() takes them as an array.",
  },
  {
    question: "Explain Function.prototype.bind.",
    answer:
      "Function.prototype.bind() creates a new function that, when called, has its 'this' value set to a provided value, with a given sequence of arguments.",
  },
  {
    question: "When would you use document.write()?",
    answer:
      "document.write() is used to write content directly to the HTML document. It's generally avoided because it can overwrite the entire document if used after the page has loaded.",
  },
  {
    question:
      "What's the difference between feature detection, feature inference, and using the UA string?",
    answer:
      "Feature detection checks if a feature exists in the browser. Feature inference assumes the existence of one feature based on another. Using the UA string checks the browser's user agent, which can be unreliable.",
  },
  {
    question: "What is AJAX?",
    answer:
      "AJAX (Asynchronous JavaScript and XML) is a technique for loading data in the background and updating the webpage without reloading.",
  },
  {
    question:
      "What are the advantages and disadvantages of using Ajax?",
    answer:
      "Advantages: Faster updates, no full page reloads. Disadvantages: Can be complex, may not work if JavaScript is disabled.",
  },
  {
    question: "What is hoisting?",
    answer:
      "Hoisting is JavaScript's behavior of moving declarations to the top of the current scope, so variables and functions can be used before they are declared.",
  },
  {
    question: "Describe event bubbling.",
    answer:
      "Event bubbling is when an event starts from the target element and bubbles up to its parent elements, triggering their event listeners.",
  },
  {
    question:
      "What's the difference between an 'attribute' and a 'property'?",
    answer:
      "Attributes are defined in HTML and initialize DOM properties. Properties are values of DOM objects that can be changed with JavaScript.",
  },
  {
    question:
      "Why is extending built-in JavaScript objects not a good idea?",
    answer:
      "Extending built-in objects can lead to conflicts and unexpected behavior, as it changes the behavior of all instances of that object.",
  },
  {
    question: "How do you extend built-in objects in JavaScript?",
    answer:
      "You extend built-in objects by adding methods to their prototype, like Array.prototype.newMethod = function(){}.",
  },
  {
    question:
      "Difference between document load event and document DOMContentLoaded event?",
    answer:
      "DOMContentLoaded fires when HTML is loaded and parsed, without waiting for stylesheets, images. Load event fires when all assets are fully loaded.",
  },
  {
    question: "What is the difference between == and ===?",
    answer:
      "== checks for value equality with type conversion, while === checks for value and type equality without conversion.",
  },
  {
    question:
      "Explain the same-origin policy with regards to JavaScript.",
    answer:
      "The same-origin policy restricts web pages from making requests to a different origin (domain, protocol, or port) than the one that served the web page.",
  },
  {
    question:
      "Make this work: duplicate([1,2,3,4,5]); // [1,2,3,4,5,1,2,3,4,5]",
    answer:
      "You can make it work by returning the array concatenated with itself: function duplicate(arr) { return arr.concat(arr); }.",
  },
  {
    question:
      "Why is it called a Ternary expression, what does the word 'Ternary' indicate?",
    answer:
      "A ternary expression is called so because it involves three parts: a condition, and two expressions - one if true, one if false.",
  },
  {
    question:
      "What is 'use strict';? What are the advantages and disadvantages to using it?",
    answer:
      "'use strict'; is a directive that enforces stricter parsing and error handling in your code. Advantages: Helps catch errors, prevents unsafe actions. Disadvantages: Can break older code.",
  },
  {
    question:
      "Create a for loop that iterates up to 100 while outputting 'fizz' at multiples of 3, 'buzz' at multiples of 5 and 'fizzbuzz' at multiples of 3 and 5",
    answer:
      "for (let i = 1; i <= 100; i++) { let output = ''; if (i % 3 === 0) output += 'fizz'; if (i % 5 === 0) output += 'buzz'; console.log(output || i); }",
  },
  {
    question:
      "Why is it, in general, a good idea to leave the global scope of a website as-is and never touch it?",
    answer:
      "Modifying the global scope can cause conflicts with other scripts and lead to bugs. It's best to keep variables and functions local.",
  },
  {
    question: "What is global scope?",
    answer:
      "Global scope is the top-level scope in JavaScript, where variables and functions are accessible from anywhere in the code.",
  },
  {
    question:
      "Why would you use something like the load event? Does this event have disadvantages? Do you know any alternatives, and why would you use those?",
    answer:
      "The load event is used to execute code after the full page load. Disadvantages: Delays execution until all assets are loaded. Alternatives: DOMContentLoaded for earlier execution.",
  },
  {
    question:
      "Explain what a single page app is and how to make one SEO-friendly.",
    answer:
      "A single page app (SPA) loads a single HTML page and updates content dynamically. To make it SEO-friendly, use server-side rendering or prerendering.",
  },
  {
    question:
      "What is the extent of your experience with Promises and/or their polyfills?",
    answer:
      "Promises simplify handling asynchronous operations, avoiding callback hell. Polyfills like 'promise-polyfill' can add support for older browsers.",
  },
  {
    question:
      "What are the pros and cons of using Promises instead of callbacks?",
    answer:
      "Pros: Cleaner code, better error handling. Cons: Slightly more complex syntax, may require polyfills for older browsers.",
  },
  {
    question:
      "What are some of the advantages/disadvantages of writing JavaScript code in a language that compiles to JavaScript?",
    answer:
      "Advantages: Advanced features, better syntax. Disadvantages: Additional build step, potential debugging complexity.",
  },
  {
    question:
      "What tools and techniques do you use debugging JavaScript code?",
    answer:
      "Tools: Browser DevTools, console.log(), breakpoints. Techniques: Step-through debugging, inspecting variables, error messages.",
  },
  {
    question:
      "What language constructions do you use for iterating over object properties and array items?",
    answer:
      "For objects: for...in loop, Object.keys(). For arrays: for loop, forEach(), map().",
  },
  {
    question:
      "Explain the difference between mutable and immutable objects.",
    answer:
      "Mutable objects can be changed after creation, like arrays. Immutable objects cannot be changed, like strings.",
  },
  {
    question: "How to make an object immutable?",
    answer: "Use Object.freeze() to prevent changes to an object.",
  },
  {
    question:
      "Explain the difference between synchronous and asynchronous functions.",
    answer:
      "Synchronous functions block code execution until they finish. Asynchronous functions allow code to run while waiting for them to complete.",
  },
  {
    question:
      "What is event loop? What is the difference between call stack and task queue?",
    answer:
      "The event loop processes tasks from the task queue. The call stack holds function calls. The task queue holds tasks waiting to run.",
  },
  {
    question:
      "Explain the differences on the usage of foo between function foo() {} and var foo = function() {}",
    answer:
      "function foo() {} is a function declaration, hoisted. var foo = function() {} is a function expression, not hoisted.",
  },
  {
    question:
      "What are the differences between variables created using let, var or const?",
    answer:
      "var is function-scoped, hoisted. let and const are block-scoped, not hoisted. const is for constants, cannot be reassigned.",
  },
  {
    question:
      "What are the differences between ES6 class and ES5 function constructors?",
    answer:
      "ES6 class is syntactic sugar over ES5 function constructors, offering a cleaner syntax and more features like static methods.",
  },
  {
    question:
      "Can you offer a use case for the new arrow => function syntax? How does this new syntax differ from other functions?",
    answer:
      "Arrow functions are useful for concise syntax and don't bind their own 'this'. Useful in callbacks. Different from regular functions which do bind 'this'.",
  },
  {
    question:
      "What advantage is there for using the arrow syntax for a method in a constructor?",
    answer:
      "Arrow functions don't have their own 'this', so they use 'this' from the containing scope, avoiding 'this' binding issues.",
  },
  {
    question: "What is the definition of a higher-order function?",
    answer:
      "A higher-order function is a function that takes another function as an argument or returns a function.",
  },
  {
    question:
      "Can you give an example for destructuring an object or an array?",
    answer:
      "Object: const {name, age} = person; Array: const [first, second] = [1, 2];",
  },

  // React Questions
  {
    question: "What is React?",
    answer: "React is a library for building user interfaces.",
  },
  {
    question: "What is Redux?",
    answer: "Redux is a state management tool for JavaScript apps.",
  },
  {
    question: "How does Redux work?",
    answer:
      "Redux uses a single store to hold the state, actions to describe changes, and reducers to update the state.",
  },
  {
    question: "What makes Redux so special?",
    answer:
      "Redux simplifies state management by keeping it in one place and making it predictable and easier to debug.",
  },
  {
    question: "Redux setup process",
    answer:
      "To set up Redux, create a store, define actions, create reducers, and connect Redux to your React components using the Provider component.",
  },
  {
    question: "How reducers work in Redux?",
    answer:
      "Reducers take the current state and an action, then return a new state based on the action type.",
  },
  {
    question: "Why did you choose React?",
    answer:
      "React is chosen for its simplicity, reusability of components, and efficient rendering with the virtual DOM.",
  },
  {
    question: "What are major features of React?",
    answer:
      "Major features include JSX, components, state management, and the virtual DOM.",
  },
  {
    question: "What is JSX?",
    answer:
      "JSX is a syntax that lets you write HTML inside JavaScript.",
  },
  {
    question:
      "What is the virtual DOM? How does the virtual DOM work?",
    answer:
      "The virtual DOM is a lightweight copy of the real DOM. It updates efficiently by comparing changes and only updating what’s necessary.",
  },
  {
    question: "What is state in React?",
    answer:
      "State is an object that holds data that can change over time in a component.",
  },
  {
    question: "What are props in React?",
    answer:
      "Props are inputs to components, used to pass data from parent to child components.",
  },
  {
    question: "What is the difference between state and props?",
    answer:
      "State is managed within the component, while props are passed from parent to child components.",
  },
  {
    question: "What does lifting state up mean and why do we do it?",
    answer:
      "Lifting state up means moving state to a common ancestor component to share it between child components.",
  },
  {
    question:
      "Why do we set up a key property when we map over an array in React?",
    answer:
      "A key helps React identify which items have changed, are added, or are removed, improving performance.",
  },
  {
    question: "What are core principles in React?",
    answer:
      "Core principles include component-based architecture, unidirectional data flow, and a focus on state management.",
  },
  {
    question: "How does React use closures?",
    answer:
      "React uses closures to retain state and props within functions even after the function has executed.",
  },
  {
    question: "React context vs Redux",
    answer:
      "React Context is simpler for passing data through the component tree, while Redux is more robust for complex state management.",
  },

  // Web Development Questions
  {
    question: "What are some status codes you know?",
    answer:
      "Common status codes: 200 (OK), 404 (Not Found), 500 (Internal Server Error).",
  },
  {
    question: "What is a 500 status code?",
    answer:
      "A 500 status code means an internal server error occurred.",
  },
  {
    question: "What is a 401 status code?",
    answer:
      "A 401 status code means unauthorized, usually due to missing or invalid authentication.",
  },
  {
    question: "What are some HTTP codes you’re familiar with?",
    answer:
      "Familiar HTTP codes: 200 (OK), 201 (Created), 400 (Bad Request), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error).",
  },
  {
    question: "What is the difference between PUT and PATCH?",
    answer:
      "PUT replaces the entire resource, while PATCH updates only parts of the resource.",
  },
  {
    question: "What is a REST API?",
    answer:
      "A REST API is a way to interact with web services using standard HTTP methods.",
  },
];
