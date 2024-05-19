from gevent import monkey
monkey.patch_all()
from flask import Flask, render_template
from flask_socketio import SocketIO
import os
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from flask_compress import Compress
from colorama import Fore, Style
import time

app = Flask('app')
compress = Compress()
compress.init_app(app)
my_secret = os.environ['SECRET_KEY']
app.config['SECRET_KEY'] = my_secret
socketio = SocketIO(app, cors_allowed_origins="*")


####################################################
####                   SERVER                   ####
####################################################

@socketio.on('connect')
def handle_connect(message):
  print(f"{Fore.RED}CONNECTION ESTABLISHED{Style.RESET_ALL}")
  socketio.emit("BOARD", "bruh")


@socketio.on('message')
def handle_message(message):
  print(f"{Fore.RED}DATA : {message} {Style.RESET_ALL}")

def CheckForwardSquares(data, squaresAllowedToMove=100):
    # Setting squaresAllowedToMove to 100 by default if there is no limit for moving forward e.g rook and queen
    # Calculating the distance between piece coords and square coords
    print(f"""
    {data[0]=}
    {data[1]=}
    """)
    blockY = int(data[1][0:1])
    pieceX, pieceY = int(data[0][3:4]), int(data[0][2:-1])
    differenceBY, differenceWY = blockY - pieceY, pieceY - blockY
  
    # Check colouring colour
    if data[0][0:-3] == "D":
      # Checking if the amount of squares forward is the permitted amount
      print("PASSING 1")
      if squaresAllowedToMove == 100:
        # This is for no limit moves e.g rook
        squaresAllowedToMove = differenceBY if differenceBY > 0 else differenceWY

      if differenceBY == 0:
        print("PASSING 2")
        # If no horizontal movement, no need to check if the space is free so just return True
        return True

      # Check if the squares in front are free
      for i in range(squaresAllowedToMove):
        print("PASSING 3")
        # If the piece is below the square
        if pieceY < blockY:
          print("PASSING 4")
          direction = 1
          # Only has the add value if i hasnt reached just before the blockX
          add = 1 if i <= blockY-1 else 0
        else:
          print("PASSING 5")
          # If the piece is to the above of the square
          direction = -1
          # Only adds the value if i hasnt reached just after (in terms of its index value) the blockX
          # Uses WY because BY would be negative so need to *-1 if using that
          add = 1 if i <= (differenceWY-1) else 0

        # Only pawn cannot move backwards
        if data[0][1:-2].startswith("P"):
          canMove = differenceBY == squaresAllowedToMove
        else:
          print("PASSING 6")
          canMove = differenceBY == squaresAllowedToMove if differenceBY > 0 else differenceWY == squaresAllowedToMove

        # If the block in whichever direction isnt free, dont allow movement
        if data[2][pieceY + ((i + add)*direction)][pieceX] != "  ":
          print("PASSING 7")
          print(f"""{data[2][pieceY + ((i + add)*direction)][pieceX]=}""")
          canMove = False
          break

    else:
      # Checking if the amount of squares forward is the permitted amount
      if squaresAllowedToMove == 100:
        # This is for no limit moves e.g rook
        squaresAllowedToMove = differenceWY if differenceWY > 0 else differenceBY

      if differenceWY == 0 :
        # If no horizontal movement, no need to check if the space is free so just return True
        return True

      # Check if the squares in front are free
      for i in range(squaresAllowedToMove):

        # If the piece is below the square
        if pieceY < blockY:
          direction = 1
          # Only has the add value if i hasnt reached just before the blockX
          add = 1 if i <= blockY-1 else 0
        else:
          # If the piece is to the above of the square
          direction = -1
          # Only adds the value if i hasnt reached just after (in terms of its index value) the blockX
          # Uses WY because BY would be negative so need to *-1 if using that
          add = 1 if i <= (differenceWY-1) else 0

        # Only pawn cannot move backwards
        if data[0][1:-2].startswith("P"):
          canMove = differenceWY == squaresAllowedToMove
        else:
          canMove = differenceWY == squaresAllowedToMove if differenceWY > 0 else differenceBY == squaresAllowedToMove

        # If the block in whichever direction isnt free, dont allow movement
        if data[2][pieceY + ((i + add)*direction)][pieceX] != "  ":
          canMove = False
          break

    return canMove

def CheckHorizontalSquares(data, allowedHorizontal, squaresAllowedToMove=None):
  # Calculate the difference betweeen the piece coords and the square coords
  # If diagonal not allowed, break. If allowed, look if between the piece and the square is a free space
  # Calculating the distance between piece coords and square coords. For clarity, it is split into multiple lines
  blockX = int(data[1][1:2])
  pieceX, pieceY = int(data[0][3:4]), int(data[0][2:-1])
  differenceBX, differenceWX = blockX - pieceX, pieceX - blockX
  
  if data[0][0:-3] == "D":
    if squaresAllowedToMove != None and differenceBX > squaresAllowedToMove or squaresAllowedToMove != None and differenceWX > squaresAllowedToMove:
      return False
      
    # If black
    if not allowedHorizontal:
      # The difference should be zero to not allow diagonal movement
      canMove = differenceBX == 0
    else:
      if differenceBX == 0:
        # If no diagonal movement, no need to check if the space is free so just return True
        return True
        
      # Check if the horizontal is free using the board
      # If the difference is positive, thats the range. If negative, its multiplied to make positive
      for i in range(differenceBX if differenceBX > 0 else differenceBX*-1):
        # If the piece is to the left of the square
        if pieceX < blockX:
          direction = 1
          # Only has the add value if i hasnt reached just before the blockX
          add = 1 if i <= blockX-1 else 0
        else:
          # If the piece is to the right of the square
          direction = -1
          # Only adds the value if i hasnt reached just after (in terms of its index value) the blockX
          # Uses WX because BX would be negative so need to *-1 if using that
          add = 1 if i <= (differenceWX-1) else 0

        canMove = True

        # If the block in whichever direction isnt free, dont allow movement
        if data[2][pieceY][pieceX + ((i + add)*direction)] != "  ":
          canMove = False
          break
  else:
    # Else white
    print("WHITEEEEEEEEE")
    if not allowedHorizontal:
      # The difference should be zero to not allow diagonal movement
      canMove = differenceWX == 0  
      
    else:
      if differenceBX == 0:
        # If no diagonal movement, no need to check if the space is free so just return True
        return True

      # Check if the diagonal is free using the board
      for i in range(differenceWX if differenceWX > 0 else differenceWX*-1):
        # If the piece is to the left of the square
        if pieceX < blockX:
          direction = 1
          # Only has the add value if i hasnt reached just before the blockX
          add = 1 if i <= blockX-1 else 0
          
        else:
          # If the piece is to the right of the square
          direction = -1
          # Only adds the value if i hasnt reached just after (in terms of its index value) the blockX
          add = 1 if i <= (differenceWX-1) else 0

        canMove = True

        # If the block in whichever direction isnt free, dont allow movement
        if data[2][pieceY][pieceX + ((i + add)*direction)] != "  ":
          canMove = False
          break

  return canMove

def CheckDiagonalSquares(data, squaresAllowedToMove=100):
  # Setting squaresAllowedToMove to 100 by default if there is no limit for moving forward e.g rook and queen
  # Calculating the distance between piece coords and square coords
  print(f"""
  {data[0]=}
  {data[1]=}
  """)
  blockX, blockY = int(data[1][1:2]), int(data[1][0:1])
  pieceX, pieceY = int(data[0][3:4]), int(data[0][2:-1])
  differenceBY, differenceWY = blockY - pieceY, pieceY - blockY
  differenceBX, differenceWX = blockX - pieceX, pieceX - blockX

  # Check colouring colour
  if data[0][0:-3] == "D":
    # Checking if the amount of squares forward is the permitted amount
    print("PASSING 1")
    if squaresAllowedToMove == 100:
      # This is for no limit moves e.g bishop
      if differenceBY > 0:
        BY = differenceBY * -1
      elif differenceBX > 0:
        BX = differenceBX * -1
      squaresAllowedToMove = BY + BX 
      # Im not entirely sure 

    if differenceBY == 0 and differenceBX == 0:
      print("PASSING 2")
      # If no diagonal movement, no need to check if the space is free so just return True
      return True

    # Check if the squares in front are free
    for i in range(squaresAllowedToMove):
      print("PASSING 3")
      # If the piece is below the square
      if pieceY < blockY:
        print("PASSING 4")
        UDdirection = 1
        # Only has the add value if i hasnt reached just before the blockX
        UDadd = 1 if i <= blockY-1 else 0
      else:
        print("PASSING 5")
        # If the piece is to the above of the square
        UDdirection = -1
        # Only adds the value if i hasnt reached just after (in terms of its index value) the blockX
        # Uses WY because BY would be negative so need to *-1 if using that
        UDadd = 1 if i <= (differenceWY-1) else 0

      if pieceX < blockX:
        LRdirection = 1
        # Only has the add value if i hasnt reached just before the blockX
        LRadd = 1 if i <= blockX-1 else 0

      else:
        # If the piece is to the right of the square
        LRdirection = -1
        # Only adds the value if i hasnt reached just after (in terms of its index value) the blockX
        LRadd = 1 if i <= (differenceWX-1) else 0

      print("PASSING 6")
      canMove = differenceBY == squaresAllowedToMove if differenceBY > 0 else differenceWY == squaresAllowedToMove

      # If the block in whichever direction isnt free, dont allow movement
      if data[2][pieceY + ((i + UDadd)*UDdirection)][pieceX + ((i + LRadd)*LRdirection)] != "  ":
        print("PASSING 7")
        print(f"""{data[2][pieceY + ((i + UDadd)*UDdirection)][pieceX + ((i + LRadd)*LRdirection)]=}""")
        canMove = False
        break

  else:
    # Checking if the amount of squares forward is the permitted amount
    if squaresAllowedToMove == 100:
      # This is for no limit moves e.g rook
      squaresAllowedToMove = differenceWY if differenceWY > 0 else differenceBY

    if differenceWY == 0 :
      # If no horizontal movement, no need to check if the space is free so just return True
      return True

    # Check if the squares in front are free
    for i in range(squaresAllowedToMove):

      # If the piece is below the square
      if pieceY < blockY:
        direction = 1
        # Only has the add value if i hasnt reached just before the blockX
        add = 1 if i <= blockY-1 else 0
      else:
        # If the piece is to the above of the square
        direction = -1
        # Only adds the value if i hasnt reached just after (in terms of its index value) the blockX
        # Uses WY because BY would be negative so need to *-1 if using that
        add = 1 if i <= (differenceWY-1) else 0

      # Only pawn cannot move backwards
      if data[0][1:-2].startswith("P"):
        canMove = differenceWY == squaresAllowedToMove
      else:
        canMove = differenceWY == squaresAllowedToMove if differenceWY > 0 else differenceBY == squaresAllowedToMove

      # If the block in whichever direction isnt free, dont allow movement
      if data[2][pieceY + ((i + add)*direction)][pieceX] != "  ":
        canMove = False
        break

  return canMove
  
  

@socketio.on('checkmove')
def check_move(data):

  print(type(data))
  print(data)
  # Checking the validity of move according to piece rules
  
  ### Pawn ###
  if data[0][1:-2].startswith("P"):

    # Checks if square in front is a block away only
    if CheckForwardSquares(data, 1) and CheckHorizontalSquares(data, False):
      data.append("Allow")
      socketio.emit('checkedmove', data)
    else:
      data.append("Not allowed")

  ### King ###
  if data[0][1:-2].startswith("K"):

    # Checks if square in front is a block away only
    if CheckForwardSquares(data, 1) and CheckHorizontalSquares(data, True, 1) or CheckDiagonalSquares(data, 1):
      data.append("Allow")
      socketio.emit('checkedmove', data)
    else:
      data.append("Not allowed")

  ### Rook ###
  if data[0][1:-2].startswith("R"):
    # Checks if square in front is free and only limiting in either horizontal/verticle plane
    if CheckForwardSquares(data, 100) and CheckHorizontalSquares(data, False) or CheckForwardSquares(data, 0) and CheckHorizontalSquares(data, True):
      data.append("Allow")
      socketio.emit('checkedmove', data)
    else:
      data.append("Not allowed")

  ### Bishop ###
  if data[0][1:-2].startswith("B"):
    # Checks if square in front is free and only limiting in either diagonal plane
    if CheckDiagonalSquares(data) and not CheckForwardSquares(data, 100):
      data.append("Allow")
      socketio.emit('checkedmove', data)
    else:
      data.append("Not allowed")




@app.route('/')
def index():
  return render_template('index.html')


if __name__ == '__main__':
  WSGIServer(socketio.run(app, host="0.0.0.0", port=8080, debug=True), app, handler_class=WebSocketHandler).serve_forever()
  