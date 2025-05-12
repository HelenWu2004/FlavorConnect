import pandas as pd
import kagglehub
import re
from nltk.corpus import stopwords

# Download the dataset
path = kagglehub.dataset_download("pes12017000148/food-ingredients-and-recipe-dataset-with-images")
print("Path to dataset files:", path)
recipes = pd.read_csv(path+"/Food Ingredients and Recipe Dataset with Image Name Mapping.csv")

# Clean the data (from block 3)
null_recs = recipes.copy().drop(columns = 'Image_Name').T.isna().any()
recipes = recipes.drop(index = recipes[null_recs].index).reset_index(drop = True)
recipes["index"] = recipes['Unnamed: 0']
recipes = recipes.drop(columns = ['Unnamed: 0', "Ingredients"])
empty_instr_ind = [index for i, index in zip(recipes['Instructions'], recipes.index) if len(i) < 20]
recipes = recipes.drop(index = empty_instr_ind).reset_index(drop=True)

# Define stopwords (from block 4)
stop_words = set(stopwords.words('english'))
punctuations =  '"\'\\,<>./?@#$%^&*_~/!()-[]{};:'
custom_stopwords = set(["cup", "cups", "minutes", "oil", "teaspoon", "tablespoon", "ounce", "ounces", "gram", "grams", "minute", "hour", "hours"])
frequent_words = set(['tablespoons', 'large','salt','heat', 'chopped','Add','fresh','sugar','bowl','butter','flour','baking','mixture','f',
 'pan','cream','large', 'chopped', 'Add', 'fresh', 'water', 'medium', 'skillet',  'sauce', 'cook', 'juice', 'cut',  'remaining', 'small','inch', 'finely', 'pot', 'oven', "new", "old", "previous",
                      'pound','sliced','tender','ground','transfer','heavy','teaspoons', 'occasionally', 'leaves','let','add','cover']
)
colors = [
    "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown",
    "black", "white", "gray", "grey", "beige", "cyan", "magenta", "teal",
    "violet", "indigo", "maroon", "turquoise", "lavender", "gold", "silver"
]

stopwords = stop_words.union(custom_stopwords).union(frequent_words).union(colors)

# Clean text function (from block 5)
def clean_text(documents):
    cleaned_text = []
    for doc in documents:
        doc = doc.lower()
        doc = re.sub(r'\\d+', ' ', doc) # Remove Digits
        line = ''.join(char for char in doc if char not in (punctuations) and (char.isalpha() or char == ' '))
        words = line.split()
        words = [word for word in words if word not in stopwords]
        cleaned = ' '.join(words)
        cleaned_text.append(cleaned)
    return cleaned_text

# Add combined_cleaned column (from block 6)
recipes["combined_cleaned"] = clean_text(recipes["Title"] + recipes["Instructions"])

# Split combined_cleaned into words (from block 8)
recipes['combined_cleaned'] = recipes['combined_cleaned'].str.split()

# Save to CSV
recipes.to_csv('cleaned_recipe_data.csv', index=False)
print("Data saved to cleaned_recipe_data.csv") 