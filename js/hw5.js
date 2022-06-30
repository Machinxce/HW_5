/*
FILE NAME: hw5.js
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

source:
https://jqueryui.com/draggable/
https://www.tutorialspoint.com/jqueryui/jqueryui_draggable.html
https://www.geeksforgeeks.org/jquery-ui-draggable-and-droppable-methods/
https://codepen.io/aluxh/pen/GGXZwR
*/

$(function() {
    var tilePool = [];
    var currentRack = [];
    var tilesOnBoard = [];
    var remainingTiles;
    var missingHandTiles;
    var currentTileID = 0
    var doubleWordFlag = false;
    var currentScore = 0;
    var totalScore = 0;

// getting the pieces
    $.get("https://machinxce.github.io/game/pieces.json")
    .done(function(response) {
        tileJSON = response.pieces;
        startGame();
      });

//for the tile placement
    $("#innerRack").droppable({
       tolerance: "fit"
     })
// drag and drop function
    $("#tileBoard div").droppable({
       tolerance: "pointer",
       drop: ifTiledropped,
       out: ifTileremoved
     })

//starting the game
     function startGame(){
        fillPool();
        rackTiles();
        addTiles(true);
      }

      function fillPool(){
        for(i = 0; i < 27; i++){//27: alphabets plus empty tile
          var currentTile = tileJSON[i];
          for(k = 0; k < currentTile.amount; k++){
            tilePool.push(currentTile);
          }
        }
      }

 //checking number of tiles on rack
      function rackTiles(){
        remainingTiles = (tilePool.length < 7) ? tilePool.length : 7;
        if(remainingTiles == 0){
          alert("Sorry ran out of tiles! Play again!");
          return;
        }
        for(i = 0; i < remainingTiles; i++){
          var rand = Math.trunc(Math.random() * tilePool.length);
           currentRack.push(tilePool[rand]);
           tilePool.splice(rand, 1);
        }
        $("#tiles_remaining").text("Tiles Remaining: " + tilePool.length) //lets player know the amount of tiles
      }

// calculating the score
      function calculateScore(){
        if(doubleWordFlag){
           doubleWordFlag = false;
        }
        var $totalscore = $("#total_score");// adding the scores accordingly
        var newScore = parseInt($totalscore.attr("currentscore")) + currentScore;
        $totalscore.attr("currentscore", newScore);
        $totalscore.text("Total Score: " + newScore );
      }

//draggable function source:https://jqueryui.com/draggable/
      function reverToRack(event, ui){
          $(this).data("ui-draggable").originalPosition = {
                top : 0,
                left : 0
            };
            return !event;
      }

//if removed, delete the score and update scoreboard
     function removePoints($letterTile, $boardTile){
        var $currScore = $("#score");
        if($boardTile.attr("class") == "doubleWord ui-droppable ui-droppable-active"){
            if(doubleWordFlag == true){
              currentScore /= 2;
            }
            doubleWordFlag = false;
            currentScore -= ($letterTile.attr("points") * $boardTile.attr("multiplier"));
            $currScore.text("Current Word Score: " + "+" + currentScore);
        }
        else{
            var letterScore =  $letterTile.attr("points") * $boardTile.attr("multiplier");
            if(doubleWordFlag){
                currentScore -= letterScore * 2;
                $currScore.text("Current Word Score: " + "+" + currentScore);
            }else{
                currentScore -= letterScore;
                $currScore.text("Current Word Score: " + "+"  + currentScore);
            }
          }
          console.log("test", doubleWordFlag);
      }

      function addPoints($letterTile, $boardTile){//add the points accordingly
          var $currScore = $("#score");
          if($boardTile.attr("class") == "doubleWord ui-droppable"){
            if(doubleWordFlag == false){
              currentScore *= 2;
            }//multipling for the double word
            doubleWordFlag = true;
            currentScore += ($letterTile.attr("points") * $boardTile.attr("multiplier")) * 2;
            $currScore.text("Current Word Score: " + "+" + currentScore);
          }
          else{//multipling for the double letter
            var letterScore =  $letterTile.attr("points") * $boardTile.attr("multiplier");
            if(doubleWordFlag){
                currentScore += letterScore * 2;
                $currScore.text("Current Word Score: " + "+" + currentScore);
              }
            else{// add to the score
                currentScore += letterScore;
                $currScore.text("Current Word Score: " + "+" + currentScore);
            }
          }
      }

      function ifTileremoved(event, ui){//remove the tiles with drag and drog
        var $this = $(this);
        var draggableId = ui.draggable.attr("id");
        var droppableId = $(this).attr("id");
        var $currScore = $("#score");
        console.log(tilesOnBoard);
        if(tilesOnBoard.includes(ui.draggable.attr("id"))){
          var boardIndex = tilesOnBoard.indexOf(ui.draggable.attr('id'));
          tilesOnBoard.splice(boardIndex,1);
          console.log(tilesOnBoard + "inside tileRemoved");
          $(this).attr("used",0);
          $(this).attr("letter", -1);
          removePoints(ui.draggable, $(this));
          updateWord();
        }
      }

// what to do when Dropped
      function ifTiledropped(event, ui) {
          var $this = $(this);
          var draggableId = ui.draggable.attr("id");
          var draggableLetter = ui.draggable.attr("letter");
          var currentword = "";
          var droppableId = $(this).attr("id");
          var $currScore = $("#score");
          console.log('Dropped letter ' + draggableLetter + ' with ID: ' + draggableId + ' onto ' + droppableId);

          if(!tilesOnBoard.includes(ui.draggable.attr("id"))){
              if($(this).attr("used") == 1){
                  ui.draggable.draggable('option','revert', reverToRack);
                  ui.draggable.animate(ui.draggable.data().origPosition= {
                     top : 0,
                     left : 0
                  },"slow");
              return;
            }
            if(ui.draggable.attr("letter") == "Blank"){
              createBlankTileDialog(ui.draggable, $(this));
            }else{
              $(this).attr("letter", draggableLetter);
            }
            tilesOnBoard.push(ui.draggable.attr("id"));
            $(this).attr("used", 1);
            addPoints(ui.draggable, $(this));

          }
          updateWord();//update the word

          ui.draggable.position({
            my: "center",
            at: "center",
            of: $this,
            using: function(pos) {
              $(this).animate(pos, 200, "linear");
            }
          });
      }


      function updateWord(){//display the word created by the player
        var currentWord = " ";
        $("#tileBoard div").each(function(index,$el){
          if($el.getAttribute("letter") != -1){
            currentWord += $el.getAttribute("letter");
          }
        });
        $("#current_word").text("Current Word: " + currentWord);
      }


      function fillRackForNextHand(){//when rack is less than 7, add the missing value of tiles
        remainingTiles = (tilePool.length < 7) ? tilePool.length : 7;
        if(remainingTiles == 0){
          alert("There are no tiles remaining. Play again?");
          return;
        }
        if(currentRack.length < 7){
            missingHandTiles = 7 - currentRack.length;
            console.log("missing" + missingHandTiles);
            for(i = 0; i < missingHandTiles; i++){
              var rand = Math.trunc(Math.random() * tilePool.length);
               currentRack.push(tilePool[rand]);
               tilePool.splice(rand, 1);
            }
            $("#tiles_remaining").text("Tiles Remaining: " + tilePool.length)
            addTiles(false);
        }
      }
//if more tiles are needed add seven tiles
      function addTiles(resetFlag){
         if(resetFlag){
           for(i = 0; i < currentRack.length; i++){
             var newTileImage = document.createElement("img");
             newTileImage.setAttribute('src', "images/Scrabble_Tiles/Scrabble_Tile_" + currentRack[i].letter + ".jpg");
             newTileImage.setAttribute('points' , currentRack[i].value);
             newTileImage.setAttribute('id', "tile" + currentTileID++);
             newTileImage.setAttribute("index", i);
             newTileImage.setAttribute("letter", currentRack[i].letter);
             newTileImage.classList.add("ui-widget-content");
             $("#innerRack").append(newTileImage);
           }
         }
         else {
           for(i = currentRack.length - missingHandTiles; i < 7; i++){
             var newTileImage = document.createElement("img");
             newTileImage.setAttribute('src', "images/Scrabble_Tiles/Scrabble_Tile_" + currentRack[i].letter + ".jpg");
             newTileImage.setAttribute('points' , currentRack[i].value); // assign points to the image
             newTileImage.setAttribute('id', "tile" + currentTileID++);
             newTileImage.setAttribute("index", i);
             newTileImage.setAttribute("letter", currentRack[i].letter);
             newTileImage.classList.add("ui-widget-content");
             $("#innerRack").append(newTileImage);
           }
         }

        $("#innerRack img").draggable({
           revert: reverToRack,
           snap: ".ui-droppable",
           refreshPositions: true,
           snapTolerance: "3",
           snapMode: "both",
           stack: ".ui-draggable",
           stop: function(){
                  $(this).draggable('option','revert', reverToRack);
                 }
          }).css({
            width: "75px",
            height: "75px",
            marginBottom: "20px"
          }).droppable({
             greedy: true,
             tolerance: 'pointer',
             drop: function(event,ui){
                       ui.draggable.animate(ui.draggable.data().origPosition= { top : 0, left : 0 },"slow");
                       var message = document.getElementById("snackbar");
                       message.className = "show";
                      setTimeout(function(){ message.className = message.className.replace("show", ""); }, 4000);
                   }
          });
      }

      function createBlankTileDialog(blankTile, boardTile){
         var tileDialog = $('<div></div>');
         tileDialog.attr('id', 'tileDialog');
         tileDialog.attr('title', 'Click on a letter.')
         tileJSON.forEach(element => {
           if(element.letter != 'Blank'){
             var tileInDialog = document.createElement("img");
             tileInDialog.setAttribute('src', "images/Scrabble_Tiles/Scrabble_Tile_" + element.letter + ".jpg");
             tileInDialog.setAttribute('letter', element.letter);
             tileInDialog.classList.add("blankTileLetters");
             tileInDialog.onclick = function() {
               blankTile.attr("letter", tileInDialog.getAttribute("letter"));
               blankTile.attr('src', tileInDialog.getAttribute("src"));
               tileDialog.dialog("close");
               boardTile.attr('letter', tileInDialog.getAttribute("letter"));
               updateWord();
            };
          }
         tileDialog.append(tileInDialog);
       });
       tileDialog.dialog({
              classes: {"ui-dialog":"no-close"},
              modal: true,
              draggable: false,
              resizable: false
       });
      }


      $("#next_word").click(function() {
        tilesOnBoard.forEach(element => {
          console.log(element);
          $("#" + element).remove();
          currentRack.splice(element.index, 1);
        });

        $("#tileBoard div").each(function(index,$el){
          $el.setAttribute("letter", -1);
        });
        tilesOnBoard = [];
        fillRackForNextHand();
        calculateScore();
        currentScore = 0;
        $("#score").text("Current Word Score: " + currentScore);
        $("#current_word").text("Current Word: ");
        $("#tileBoard div").attr("used", 0);
     })

        $("#reset_tile").click(function() {
        currentRack = [];
        tilesOnBoard = []; //reset board
        totalScore = 0;
        currentScore = 0
        $("#tileBoard div").each(function(index,$el){
          $el.setAttribute("letter", -1);
        });
        $("#innerRack img").remove();
        rackTiles();
        addTiles(true);
     })

     $("#new_game").click(function() {
       currentRack = [];
       tilesOnBoard = []; //reset board
       tilePool = [];
       totalScore = 0;
       currentScore = 0
       $("#tileBoard div").each(function(index,$el){
         $el.setAttribute("letter", -1);
       });
       $("#score").text("Current Word Score: " + currentScore);
       $("#total_score").text("Total Score: " + totalScore);
       $("#total_score").attr("currentscore", 0);
       $("#innerRack img").remove();
       $("#tileBoard div").attr("used", 0);
       $("#current_word").text("Current Word: ");
       startGame();
       console.log(currentRack);
    })

    //Refill tile pool back to 100
    $("#refill_pool").click(function() {
      tilePool = [];
      fillPool();
      $("#tiles_remaining").text("Tiles Remaining: " + tilePool.length)
      console.log(currentRack);
   })

 });
