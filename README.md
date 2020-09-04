


## Smarter Preprocessor

A smarter preprocessor for Node.js.

* License: MIT
* Current status: alpha



Smarter Preprocessor allows you to preprocess a Javascript module, to build modified versions of the module,
or even load a modified version of the module at run-time (*module.preprocessorRequire()*).

But instead of adding preprocessor commands that would turn your code into non-Javascript, or hide them behind comment marks,
the great idea behind Smarter Preprocessor is that **preprocessor commands ARE actual Javascript code**, and that
that **your code would run fine without even preprocessing it**, falling back to default behavior.

It is a [strong recommandation](#recommendations) to keep it operational without preprocessing.



##### Common use cases: 

* you want a lot of logs in development mode, but you don't even want that the production code had to filter them out
  with dozens of *if* statements.

* your source code uses specific features of an engine, but you have specified an alternative code
  that is compatible with another.

* you have some server code that works fine, you want to build a browser-compatible version

Be sure to check the [recommendations](#recommendations).



## smarter-preprocessor: the CLI program

Smarter Preprocessor can be invoked as a Command Line utility to build an alternative version of your code.

After installing it globally, using `npm install -g smarter-preprocessor`, we can run it from everywhere.

The syntax is simple:

`smarter-preprocessor <source-file> [dest-file] [--switch1 [value1]] [--switch2 [value2]] [...]`.

If *dest* is not given, the standard output will be assumed. It's useful if we have to pipe that into another program.

All *switches* are identifiers we have used in our source-file. See below.

Any alpha-numric string can be used as a *switch*.
Just try to be consistent with other projects.

Some examples:

* `smarter-preprocessor main.js main.debug.js --debug`: build the *main.debug.js* file from *main.js*, using the *debug* parameter
* `smarter-preprocessor main.js main.trace.js --loglevel trace`: build the *main.trace.js* file from *main.js*,
  setting the *loglevel* parameter to 'trace'



## Require a module and pre-process it on-the-fly

Smarter Preprocessor can *require* a module while pre-processing it on-the-fly.



### module.preprocessorRequire( modulePath , switches , [ options ] )

* modulePath: `string` the module file path to load
* switches: `object` an object containing the preprocessor switches
* options: `object` *optional*, contains some options, available options are:
	* multi: if the module is required multiple times with different *switches* objects, multiple
		instances of the module will be spawned. Without this options, subsequent *require* will use the first
		instance even if the *switches* object has different options. Some node.js module execute code
		at require-time, that's why the default behaviour is to share only one instance, just like a normal *require()* does.

```js
var spp = require( 'smarter-preprocessor' ) ;	// Load the smarter preprocessor module

var myModule = module.preprocessorRequire( 'my-module' , { config1: true , config2: 4 } ) ;
```

The `.preprocessorRequire()` method is added to the module prototype itself,
that way, ISO behavior with vanilla `require()` is guaranted.
Also this method is accessible from files that do not require *'smarter-preprocessor'* directly.



<a name="recommendations"></a>
## Recommendations / Good practices

* Your source code should be working without any preprocessing. That's what make
  [Preprocessor.js](http://npmjs.org/package/preprocessor) a bad thing, Javascript must run unprocessed, out of the box.
* **In fact**, your source code should be your standard / **production** version
* Use runtime *module.preprocessorRequire()* only for development, debugging, or any kind of fail-safe or emergency mode,
  that's not a good practice to use it for production running in standard mode.



