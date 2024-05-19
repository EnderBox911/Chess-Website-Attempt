class Board {
  constructor () {
    //console.log(this.board_disp);
    this.namespace = "http://www.w3.org/2000/svg";
    this.width = 12.5;
    this.height = 12.5;
    this.startx = 0;
    this.starty = 0;
    this.board = this.make_board();
    this.selected = null;
    console.log(this.board);
    this.socket = null;
  }

  make_board() {
    let board = [
      ["BR", "BN", "BB", "BQ", "BK", "BB", "BN", "BR"],
      ["BP", "BP", "BP", "BP", "BP", "BP", "BP", "BP"],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["WP", "WP", "WP", "WP", "WP", "WP", "WP", "WP"],
      ["WR", "WN", "WB", "WQ", "WK", "WB", "WN", "WR"],
    ]
    return board
  }
  
  make_visual_board() {
    let x = this.startx;
    let y = this.starty;
    
    let board_disp = document.querySelector("#main_board");
    
    for (let i=0; i<8; i++) {
      
      for (let c=0; c<8; c++) {

        // making a board square
        let square = this.make_square(i, c, x, y);
        
        // adding the board square to the svg element
        board_disp.appendChild(square);
        
        if (i < 2 || i > 5) {
          // making a piece
          console.log("PIECE X AND Y:")
          console.log(x, y)
          let piece = this.make_piece(i, c, x, y);
          
          // adding the piece to the svg element
          square.appendChild(piece); 
        }

        x += this.width;
        console.log(x);
      }
      
      y += this.height;
      x = this.startx;
      
    }
  }
  
  make_square(i, c, x, y) {
    // making the squares
    let square = document.createElement("div");

    // checking whether to make the square light or dark
    this.square_colour(i, c, square);

    // Setting the position of the square in terms of it's array pos as it's ID
    square.setAttribute("id", `${i}${c}`)
    
    // adding necessary classes for the square divs
    square.classList.add("square");
    
    square.setAttribute("ondrop", "MainBoard.piece_drop(event);");
    square.setAttribute("ondragover", "MainBoard.over_square(event);");
    
    return square
  }
  
  make_piece(i, c, x, y) {
    let col = "";
    // checking what the piece symbol should be
    let piece_symbol = i == 0 || i == 7 ? ["r", "n", "b", "q", "k", "b", "n", "r"][c] : "p";
    console.log(piece_symbol);
    
    // checking what the color should be
    if (i < 2) {
      col = "d";
    } else if (i > 5) {
      col = "l";
    }

    // add an image element for the pieces
    let piece_div = document.createElement("img");
    
    // adding the class and id to the image
    piece_div.classList.add("piece");
    // The ID is set in terms of the pieces' position in the array
    piece_div.id = col.toUpperCase()+piece_symbol.toUpperCase()+(i).toString()+(c).toString()

    // adding event binds to the piece
    console.log("GOING THROUGHHH");
    console.log(piece_div);
    piece_div.setAttribute('src', `static/img/Chess_${piece_symbol}${col}t45.svg.png`);
    piece_div.setAttribute('draggable', 'true');
    piece_div.setAttribute('ondragstart', 'MainBoard.piece_startdrag(event);');
    console.log(piece_div.id, "IDDD PIECE");
    $(`${piece_div.id}`).on('dragstart', function() {
      alert(this);
      console.log(this, "THISS BOIIIS");
    });
    
    // return the div
    return piece_div
  }
  
  square_colour(i, c, square) {
    let row_even = i % 2 == 0;
    let col_even = c % 2 == 0;
    if (row_even) {
      if (col_even) {
        square.classList.add("light");
      } else {
        square.classList.add("dark");
      }
    } else {
      if (col_even) {
        square.classList.add("dark");
      } else {
        square.classList.add("light");
      }
    }
  }

  piece_startdrag(event) {
    console.log(this);
    let data = null;
    // InterEnds.check_move_validity(data);
    
    // Sets "text" as the chess piece's ID
    event.dataTransfer.setData("text", event.target.id);
  }

  over_square(event) {
    event.preventDefault();
  }
  
  piece_drop(event) {
    event.preventDefault();
    // Retrieves the piece's data
    let piece = event.dataTransfer.getData("text");
    
    // Setting data array as the piece coords, new block's id and the board 
    console.log(event.target, event.target.id);
    // let data = event.target.hasChildNodes() ? [piece, event.target.id, event.target.firstChild.id] : [piece, event.target.id];
    let data = [piece, event.target.id, MainBoard.board];

    // added by mat 5/19/2024 12:46 AM
    // changing data to JSON cause I looked at your CheckSquares functions and HOLY MOLY its painful to see so many list index '[]' in a row
    // changing to a JSON dictionary will also make it easier to get certain parts of the data
    // let data = {
    //   "SelectedPiece": piece, 
    //   "DroppedSquare": event.target.id,
    //   "Board": MainBoard.board
    // };
    
    // Checking validity of the move
    let valid = this.check_move_validity(data);
    
  }

  check_move_validity (data) {
    this.socket.emit('checkmove', data);
  }
  
}

var MainBoard = new Board();

//MainBoard.add_notation();
//MainBoard.border_test();

//MainBoard.test();

$(document).ready(function() {
  var socket = io.connect(window.location.href);

  class InterEnds {
    
  }
  
  socket.on('connect', function() {
    socket.send("User connected: Main");
    
    MainBoard.make_visual_board();
    MainBoard.socket = socket;
  });

  socket.on('BOARD', function(data) {
    $('#messages').append(data);
  });

  socket.on('checkedmove', function(data) {
    console.log(data, "RECIEVED POST CHECKINNGNHN");
    
    if (data[3] == "Allow") {
      // Moves the piece into the block
      document.getElementById(data[1]).appendChild(document.getElementById(data[0]));
  
      // Update the Board array with new positions
      let piece = document.getElementById(data[0]);
      let pieceX = piece.id.substring(2,3);
      let pieceY = piece.id.substring(3,4);
      let newSquareX = data[1].substring(0,1);
      let newSquareY = data[1].substring(1,2);
      let temp = MainBoard.board[newSquareX][newSquareY];
      MainBoard.board[newSquareX][newSquareY] = MainBoard.board[pieceX][pieceY];
      MainBoard.board[pieceX][pieceY] = temp;
      console.log(MainBoard.board);
  
      // Update piece's ID to new position
      piece.id = piece.id.substring(0, 2) + data[1].toString();
    } else {
      // Puts the block back to its old sqaure
    }
  });

  function getImgElements(params) {
    console.log("FINDING IMAGES");
    let imgs = document.getElementsByTagName("img");
    console.log(imgs, imgs.length, imgs[0]);
    for (let img of imgs) {
      console.log("YOO"+img.id);
    }
  }

  getImgElements();
})