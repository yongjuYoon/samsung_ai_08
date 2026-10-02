import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('L')
im.thumbnail((200,200))
px=list(im.getdata())
# fraction of near-white pixels
white=sum(1 for p in px if p>245)/len(px)
# stddev-ish spread
mn,mx=min(px),max(px)
print(f"white_frac={white:.3f} min={mn} max={mx} spread={mx-mn}")
