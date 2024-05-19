class Piece:
  pieces = []
  def __init__(self, rank, pos):
    self.rank = rank
    self.pos = pos
    self.symbol = self.colour[0] + rank[0]

    Piece.pieces.append(self)

  def __repr__(self):
    return f"{self.symbol}"
    
class WhitePiece(Piece):
  white_pieces = []
  def __init__(self, rank, pos):
    self.colour = "White"
    super().__init__(rank, pos)
    
    self.__class__.white_pieces.append(self)

class BlackPiece(Piece):
  black_pieces = []
  def __init__(self, rank, pos):
    self.colour = "Black"
    super().__init__(rank, pos)

    self.__class__.black_pieces.append(self)

rankcol = ["Rook", "Night", "Bishop", "King", "Queen", "Bishop", "Night", "Rook"]


board = [["" for _ in range(8)] for _ in range(8)]
print(board)

def print_board():
  for row in board:
    print(row)

for i in range(8):
  for c in range(8):
    if i < 2:
      if i == 2:
        currank = "Pawn"
      else:
        currank = rankcol[c]
        
      BlackPiece(
        rank = currank,
        pos = (i, c)
      )
      
      board[i][c] = Piece.pieces[-1]

    elif i > 5:
      if i == 6:
        currank = "Pawn"
      else:
        currank = rankcol[c]

      WhitePiece(
        rank = currank,
        pos = (i, c)
      )

      board[i][c] = Piece.pieces[-1]