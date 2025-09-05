import random

clubs = ['Baseball Club',
    'Basketball Club',
    'Bingo Club',
    'Board Games Club',
    'Book Club',
    'Choir Club',
    'Crochet Club',
    'Culture Club',
    'Defenestration Club',
    'Disney Movie Club',
    'Four Square Club',
    'Gaming Club',
    'General Academic Support',
    'Green Team',
    'Jazz Club',
    'Lego Club',
    'Minecraft Club',
    'Origami Club',
    'Puzzle Club',
    'Unity Club',
    'Volleyball Club',
    'Walking Club']

for i in range (450):
    choices = random.sample(clubs, 3)
    print('01-01-1900,email_' + f"{i:03d}" + '@school.edu,FirstName_' + f"{i:03d}" + ',LastName_' + f"{i:03d}" + ',09,' + choices[0] + ',' + choices[1] + ',' + choices[2])