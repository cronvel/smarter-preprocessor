/*
	Smart Preprocessor

	Copyright (c) 2014 - 2020 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const fs = require( 'fs' ) ;
const path = require( 'path' ) ;
//const osTmpDir = require( 'os' ).tmpdir() ;

// This is the Node.js core Module class
const Module = require( 'module' ) ;



const smarterPreprocessor = {} ;
module.exports = smarterPreprocessor ;

const Preprocessor = smarterPreprocessor.Preprocessor = require( './Preprocessor.js' ) ;



smarterPreprocessor.preprocess = ( str , parameters ) => {
	var preprocessor = new Preprocessor( parameters ) ;
	return preprocessor.preprocess( str ) ;
} ;



// Must be attached to a module object
Module.prototype.preprocessorRequire =
smarterPreprocessor.preprocessorRequire = ( id , parameters , options ) => {
	var resolvedPath , outputPath , outputFilename , sppId , content ;

	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	// Unfortunately, module.require.resolve() does not exist
	//sppId = resolvedPath = this.require.resolve( id ) ;
	//sppId = resolvedPath = require.resolve( id ) ;
	sppId = resolvedPath = Module._resolveFilename( id , this ) ;
	//console.log( "sppId:" , sppId ) ;

	if ( options.multi ) { sppId += JSON.stringify( parameters ) ; }

	if ( smarterPreprocessor.requireCache[ sppId ] ) {
		//console.log( 'Cache hit!' ) ;
		return smarterPreprocessor.requireCache[ sppId ].exports ;
	}

	content = smarterPreprocessor.preprocess(
		fs.readFileSync( resolvedPath , { encoding: 'utf8' } ) ,
		parameters
	) ;

	var module_ = new Module( resolvedPath , this ) ;

	module_.filename = resolvedPath ;
	module_.paths = Module._nodeModulePaths( path.dirname( resolvedPath ) ) ;

	//console.log( module_ ) ;

	module_._compile( content , resolvedPath ) ;
	module_.loaded = true ;

	// Put the preprocecessed module in the cache
	smarterPreprocessor.requireCache[ sppId ] = module_ ;

	return module_.exports ;
} ;



// The module cache, so same files are not preprocessed again and again
smarterPreprocessor.requireCache = {} ;



// Build synchronously: preprocess a file and write the build.
smarterPreprocessor.buildSync = ( inputPath , outputPath , parameters ) => {
	fs.writeFileSync(
		outputPath ,
		smarterPreprocessor.preprocess(
			fs.readFileSync( inputPath , { encoding: 'utf8' } ) ,
			parameters
		) ,
		{ encoding: 'utf8' }
	) ;
} ;



// Preprocess a file and write it to standard output
smarterPreprocessor.buildStdout = ( inputPath , parameters ) => {
	process.stdout.write(
		smarterPreprocessor.preprocess(
			fs.readFileSync( inputPath , { encoding: 'utf8' } ) ,
			parameters
		)
	) ;
} ;





/* Command Line Interface */



smarterPreprocessor.cli = () => {
	var source , dest , parameters ;

	if ( process.argv.length < 3 ) {
		console.error( 'Usage is: smarter-preprocessor <source-file> [dest-file] [--parameter1 value1] [--parameter2 value2] [...]' ) ;
		process.exit( 1 ) ;
	}

	parameters = require( 'minimist' )( process.argv.slice( 2 ) ) ;
	//console.log( parameters ) ;

	source = parameters._[ 0 ] ;
	dest = parameters._[ 1 ] ;

	// Cleanup parameters...
	delete parameters._ ;

	try {
		if ( dest ) { smarterPreprocessor.buildSync( source , dest , parameters ) ; }
		else { smarterPreprocessor.buildStdout( source , parameters ) ; }
	}
	catch ( error ) {
		console.error( 'Some errors occurs: ' , error ) ;
		process.exit( 1 ) ;
	}

	process.exit( 0 ) ;
} ;

