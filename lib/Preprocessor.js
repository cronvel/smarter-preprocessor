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



const falafel = require( '@cronvel/falafel' ) ;
const ECMA_VERSION = 9 ;



function Preprocessor( params ) {
	this.params = params ;
	this.STATIC = "STATIC" ;
}

module.exports = Preprocessor ;



Preprocessor.prototype.preprocess = function( str , parameters ) {
	return falafel( str , {
			//locations: true ,
			comment: true ,
			ecmaVersion: ECMA_VERSION ,

			allowHashBang: true ,

			//sourceType: 'module' ,
			allowReturnOutsideFunction: true ,

			// important or conditional tracking may fail with code like:
			// if ( var1 && ( var2 = expression ) )
			preserveParens: true ,

			onComment: this.onComment.bind( this , parameters )
		} ,
		this.transform.bind( this , parameters )
	) ;
} ;



Preprocessor.prototype.onComment = function( parameters , blockComment , content , startOffset , endOffset , start , end ) {
} ;



Preprocessor.prototype.transform = function( parameters , node ) {
	if ( node.type === 'IfStatement' ) {
		console.log( "\n\n\nFound a If statement:" , node ) ;
		console.log( "\n===> Found a If statement test:" , node.test ) ;
		if (
			node.test.type === 'MemberExpression'
			&& node.test.object.type === 'Identifier'
			&& node.test.object.name === this.STATIC
		) {
			console.log( "\n\t=====> Found it!" , node.test.property ) ;
		}
	}
} ;







function evalCondition( leftValue , operator , rightValue , aliases ) {
	var parsed , leftIsNumber , rightIsNumber ;

	// If no leftValue, it's false
	if ( leftValue === undefined ) { return false ; }

	// If no operator, it is true (only undefined return false, 0 MUST return true)
	if ( ! operator ) { return true ; }


	// Replace alias
	if ( aliases && typeof leftValue === 'string' && aliases[ leftValue ] !== undefined ) { leftValue = aliases[ leftValue ] ; }
	if ( aliases && typeof rightValue === 'string' && aliases[ rightValue ] !== undefined ) { rightValue = aliases[ rightValue ] ; }

	// Cast to number if possible
	parsed = parseFloat( leftValue ) ;
	if ( ! isNaN( parsed ) ) { leftValue = parsed ; leftIsNumber = true ; }

	parsed = parseFloat( rightValue ) ;
	if ( ! isNaN( parsed ) ) { rightValue = parsed ; rightIsNumber = true ; }

	// Equals operators...
	if ( operator === '=' ) { return leftValue === rightValue ; }

	// Below, we will check with < and > operator, so if one value is not a number, the condition return false
	if ( ! leftIsNumber || ! rightIsNumber ) { return false ; }

	if ( operator === '<' ) { return leftValue < rightValue ; }

	if ( operator === '<=' ) { return leftValue <= rightValue ; }

	if ( operator === '>' ) { return leftValue > rightValue ; }

	if ( operator === '>=' ) { return leftValue >= rightValue ; }

	// Should never happen
	return false ;
}

