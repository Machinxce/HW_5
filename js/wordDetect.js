/**
FILE NAME: wordDetect.js
ASSIGNMENT: Implementing a Bit of Scrabble with Drag-and-Drop
Samin Basir
Samin_basir@student.uml.edu
Computer Science Student UMass Lowel GUI Programming I
Date: 6/29/2022

PROJECT DESCRIPTION:  The purposes of this assignment is to implement additional experience
working with the jQuery UI and to pull together much of what we’ve
been doing throughout the semester. we implemented a bit of the
game of Scrabble using drag-and-drop. The idea is to display one
line of the Scrabble board (one line sample) to the user along with
seven letter tiles on a tile rack. The user then drags tiles to the board
to make a word, and you are to report his or her score, taking the letter
values and bonus squares into consideration.
 */

if (typeof ScrabbleDictionary == 'undefined') {
    var ScrabbleDictionary = function() {
        var dictionary = {};

        function init() { // getting the dictionary file
            $.get('txt/dictionary.txt', function(txt) {

                let words = txt.split("\n");// splitting words into array

                for(let i = 0; i < words.length; i++) {
                    dictionary[words[i]] = true;
                }
            });
        }

        function validateWord(aWord) {

            return (dictionary[aWord.toLowerCase()]) ? true : false;// if the word is in the dictionary return true or elese false.
        }

        return {
            init: init,
            validateWord: validateWord
        }
    };
}
