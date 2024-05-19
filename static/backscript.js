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
    this.offset = null
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
  
  border_test() {
    let board_disp = document.querySelector("svg");
    let square = document.createElementNS(this.namespace, 'rect');
    // adding the attributes to the square
    square.setAttribute('x', 0);
    square.setAttribute('y', 0);
    square.setAttribute('width', '100%');
    square.setAttribute('height', '100%');
    
    // adding the square to the svg element
    board_disp.appendChild(square);
  }
  
  make_visual_board() {
    let x = this.startx;
    let y = this.starty;
    
    let board_disp = document.querySelector("svg");
    
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
          board_disp.appendChild(piece);
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
    let square = document.createElementNS(this.namespace, 'rect');

    // checking whether to make the square light or dark
    this.square_colour(i, c, square);
    
    // adding the attributes to the square
    square.setAttribute('x', `${x}%`);
    square.setAttribute('y', `${y}%`);
    square.setAttribute('width', `${this.width}%`);
    square.setAttribute('height', `${this.height}%`);

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
    let piece_div = document.createElementNS(this.namespace, "image");
    
    // adding the class and id to the image
    piece_div.classList.add("piece");
    piece_div.id = piece_symbol.toUpperCase()+(i+1).toString()+(c+1).toString()

    // adding event binds to the piece
    console.log("GOING THROUGHHH");
    console.log(piece_div);
    //this.add_Piece_Event_Binds(piece_div);
    

    // adding attributes to the piece
    
    piece_div.setAttribute('x', `${x}%`);
    piece_div.setAttribute('y', `${y}%`);
    piece_div.setAttribute('width', `${this.width}%`);
    piece_div.setAttribute('height', `${this.height}%`);
    piece_div.setAttribute('href', `static/img/Chess_${piece_symbol}${col}t45.svg.png`);
    
    // return the div
    return piece_div
  }

  add_Piece_Event_Binds(piece_div) {
    piece_div.addEventListener('mousedown', () => {this.test_startdrag()});
    piece_div.addEventListener('mousemove', (event) => {this.test_mousemove(event, piece_div)});
    piece_div.addEventListener('mouseup', () => {this.test_release()});
  }

  
  setup_svg(event) {
    console.log("EVENT SVG SETUP:", event);
    // getting the svg element
    let svg = event.target;

    svg.addEventListener("mousedown", (event) => {this.start_drag(event)});
    svg.addEventListener("mousemove", (event) => {this.mouse_move(event)});
    svg.addEventListener("mouseup", (event) => {this.release(event)});
    //svg.addEventListener("mouseleave", (event) => {this.release(event)});
    
    svg.addEventListener("touchstart", (event) => {this.start_drag(event)});
    svg.addEventListener("touchmove", (event) => {this.mouse_move(event)});
    svg.addEventListener("touchend", (event) => {this.release(event)});

  }

  start_drag(event) {
    // Stops pieces from moving when user selects nothing and drags OVER pieces 
    // Checks if user is currently on a piece when mousedown is detected
    if (event.target.classList.contains("piece")) {
      this.selected = true;
      let selectedElement = event.target;  
      this.offset = this.getMousePosition(event);
      this.offset.x -= parseFloat(selectedElement.getAttribute("x"));
      this.offset.y -= parseFloat(selectedElement.getAttribute("y"));
      console.log("down");
    }
  }

  release(event) {
    this.selected = false;
    console.log("up");
  }

  mouse_move(event) {
    // Checking if a piece has been selected
    if (event.target.classList.contains("piece") && this.selected) {
      console.log(event.target.classList);
      console.log("TARG", this);
      // getting the mouse position 
      let mousepos = this.getMousePosition(event);
      event.target.setAttributeNS(null, "x", mousepos.x - this.offset.x);
      event.target.setAttributeNS(null, "y", mousepos.y - this.offset.y);
      console.log("Dragging")
      
    }
  }

  
  test_startdrag() {
    console.log(event.target);
    this.selected = true;
    console.log("down", this);
  }

  test_release() {
    this.selected = false;
    console.log("up", this);
  }

  test_mousemove(event, piece_div) {
    console.log("moving");
    let mousepos = this.getMousePosition(event);
    
    console.log(mousepos.x, mousepos.y);
    console.log(event, "EVENT");
    console.log(this);
    console.log(piece_div);
    
    if (this.selected) {
      event.preventDefault();
      console.log("PERCENT MOVEMENT:");
      console.log((mousepos.x/1000)*100, (mousepos.y/1000)*100);

      piece_div.setAttribute("x", mousepos.x);
      piece_div.setAttribute("y", mousepos.y);
      
      //piece_div.setAttributeNS(this.namespace, "x", mousepos.x);
      //piece_div.setAttributeNS(this.namespace, "y", mousepos.y);
      
      console.log("the mouse")
    }
  }
  
  getMousePosition(event) {
    var CTM = document.querySelector("svg").getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d
    };
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

  add_notation() {
    let x = 12.375;
    let y = 12.375;
    let board_disp = document.querySelector("svg");
    
    for (let i=0; i<8; i++) {
      let note = document.createElementNS(this.namespace, "text");
      note.setAttribute('x', x);
      note.setAttribute('y', x);
    }
  }
}

var MainBoard = new Board();

//MainBoard.add_notation();
//MainBoard.border_test();

//MainBoard.test();

$(document).ready(function() {
  var socket = io.connect("https://chess-website.akmalyahaya.repl.co")
  
  socket.on('connect', function() {
    socket.send("User connected: Main");
    
    MainBoard.make_visual_board();
  });

  socket.on('BOARD', function(data) {
    $('#messages').append(data);
  });

})