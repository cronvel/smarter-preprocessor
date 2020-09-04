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

		onComment: this.onComment.bind( this )
	} ,
	this.transform.bind( this )
	) ;
} ;



Preprocessor.prototype.onComment = function( blockComment , content , startOffset , endOffset , start , end ) {
} ;



Preprocessor.prototype.transform = function( node ) {
	if ( node.type === 'IfStatement' ) {
		//console.log( "\nIf:" , node ) ;
		if (
			node.test.type === 'MemberExpression'
			&& node.test.object.type === 'Identifier'
			&& node.test.object.name === this.STATIC
		) {
			// if ( STATIC.param ) detected
			/*
			console.log( "\n=====> Found it:" , node.test.property.name ) ;
			console.log( "\nIf:" , node ) ;
			console.log( "\nIf test:" , node.test ) ;
			//*/
			this.updateNode( node , node.consequent , this.params[ node.test.property.name ] ) ;
		}
		else if (
			node.test.type === 'UnaryExpression'
			&& node.test.argument.type === 'MemberExpression'
			&& node.test.argument.object.type === 'Identifier'
			&& node.test.argument.object.name === this.STATIC
		) {
			// if ( ! STATIC.param ) detected
			switch ( node.test.operator ) {
				case '!' :
					this.updateNode( node , node.consequent , ! this.params[ node.test.argument.property.name ] ) ;
					break ;
			}
		}
		else if (
			node.test.type === 'BinaryExpression'
			&& node.test.left.type === 'MemberExpression'
			&& node.test.left.object.type === 'Identifier'
			&& node.test.left.object.name === this.STATIC
			&& node.test.right.type === 'Literal'
		) {
			// if ( STATIC.param === "literal" ) detected
			switch ( node.test.operator ) {
				case '===' :
					this.updateNode( node , node.consequent , this.params[ node.test.left.property.name ] === node.test.right.value ) ;
					break ;
				case '==' :
					this.updateNode( node , node.consequent , this.params[ node.test.left.property.name ] == node.test.right.value ) ;	/* eslint-disable-line eqeqeq */
					break ;
				case '>' :
					this.updateNode( node , node.consequent , this.params[ node.test.left.property.name ] > node.test.right.value ) ;
					break ;
				case '>=' :
					this.updateNode( node , node.consequent , this.params[ node.test.left.property.name ] >= node.test.right.value ) ;
					break ;
				case '<' :
					this.updateNode( node , node.consequent , this.params[ node.test.left.property.name ] < node.test.right.value ) ;
					break ;
				case '<=' :
					this.updateNode( node , node.consequent , this.params[ node.test.left.property.name ] <= node.test.right.value ) ;
					break ;
			}
		}
	}
} ;



Preprocessor.prototype.updateNode = function( sourceNode , contentNode , condition ) {
	if ( condition ) {
		if ( contentNode.type === 'BlockStatement' ) {
			//console.log( "\nIf consequent:" , contentNode ) ;
			sourceNode.update( contentNode.body[ 0 ].source() ) ;
		}
		else {
			sourceNode.update( contentNode.source() ) ;
		}
	}
	else {
		sourceNode.update( '' ) ;
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

