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

/* global describe, it, before, after */



const spp = require( '..' ) ;
const string = require( 'string-kit' ) ;
const fs = require( 'fs' ) ;





describe( "Preprocessor" , () => {
	
	it( "Test" , () => {
		var input , output ;
		input = 'var str = "some string" ;\n\n'
			+ 'if ( a === b ) {\n'
				+ '\tconsole.log( "equal!" ) ;\n'
				+ '\tif ( STATIC.debug ) {\n\t\tconsole.log( "debug1!" ) ;\n\t}\n'
			+ '}\n\n'
			+ 'if ( STATIC.debug ) {\n\tconsole.log( "debug2!" ) ;\n}\n'
			+ 'if ( STATIC.param1 === "value" ) {\n\trunSomeCode() ;\n}\n'
			+ 'if ( ! STATIC.debug ) {\n\trunProductionStuffs() ;\n}\n' ;
		
		console.log( "input:\n" + input + "\n" ) ;
		output = spp.preprocess( input , { debug: true , param1: 'value' } ) ;
		console.log( "\n\n=========\n\noutput:\n" + output + "\n" ) ;
		
		return
		
		output = spp.preprocess( input , {} ) ;
		console.log( "\n\n=========\n\noutput:\n" + output + "\n" ) ;
	} ) ;
} ) ;


