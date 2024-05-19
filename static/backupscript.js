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
    piece_div.id = piece_symbol.toUpperCase()+(i+1).toString()+(c+1).toString()

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
    InterEnds.check_move_validity(data);
    event.dataTransfer.setData("text", event.target.id);
  }

  over_square(event) {
    event.preventDefault();
  }
  
  piece_drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    event.target.appendChild(document.getElementById(data))
  }

  check_move_validity(data) {
      socket.emit('checkmove', "CHECKDATA");
    }
  
}

var MainBoard = new Board();

//MainBoard.add_notation();
//MainBoard.border_test();

//MainBoard.test();

$(document).ready(function() {
  var socket = io.connect("https://chess-website.akmalyahaya.repl.co")

  class InterEnds {
    
  }
  
  socket.on('connect', function() {
    socket.send("User connected: Main");
    
    MainBoard.make_visual_board();
  });

  socket.on('BOARD', function(data) {
    $('#messages').append(data);
  });

  socket.on('checkedmove', function() {
    alert("checked stuff");
  });

})