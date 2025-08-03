const promptTemplates = {
	"Image Slider": `The uploaded image is a visual layout from an educational book. It includes a labeled diagram or table showing types of scientific concepts or classifications (such as types of compounds, forces, cells, etc.).
Each section typically contains:

A visual representation (photo or icon) of a concept,

A label or title indicating the category or type,

Sometimes a chemical formula, term, or sub-label below the image.

Your task is to extract and convert this image into an <”Category”: “Illustrative Object”> of type <”typeName”: “Image Slider”> in the following JSON format:

{
  "Json Object": {
    "ObjectType": "Image Slider",
    "ObjectName": "TEXT",
    "AbstractParameter": {
      "_Title_": "TEXT",
      "Slides 2": [
        {
          "_Picture_": "CROPPED_IMAGE_URL",
          "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)",
          "_AltText_": "TEXT",
          "_HoverText_": "TEXT"
        }
      ]
    }
  }
}


Instructions:
Identify and extract each logical section (such as each compound type or labeled group). These sections are usually visually separated (e.g., columns or boxes).

Treat each section as a separate slide:

Crop only the relevant section (image + its labels).

Assign the category/label/title as the _HoverText_.

Write a meaningful description of the image contents in _AltText_, including any visible chemical name, object, or action.

Use the full image dimensions to compute _NormalizedCoordinates_ for each cropped section:

x = zero-indexed offset from left edge / imageWidth
y = zero-indexed offset from top edge / imageHeight
w = width / imageWidth
h = height / imageHeight

Return the raw values: x, y, w, h

Ensure the number of slides matches the number of labeled sections or categories in the image.

All fields must be filled:

ObjectName: A descriptive title of the entire object (e.g., "Types of Compounds").

_Title_: The same or similar title.

_AltText_: A description of the cropped image.

_HoverText_: a description of the image.

The output text (labels, names, descriptions, alt text, etc) must match the language used in the uploaded image.

Do not leave any field empty or null.
Please return JSON without embedding base64 image data. Instead, use external image URLs or placeholders like "https://example.com/image.jpg".

`,

	"Hotspot Image": `
The uploaded image is a crop from a book page.  It is of type <”Hotspot Image”> that is a <”Category”> <”illustration”> that <”Descriptio”> “ recognize the important objects in the image, plots one or more spots on important objects in the image, recognize the object itself in the image and return it's positions, and designates a piece of content/explanation to each spot”.  It is required to represent it as an interactive object.  Would you please represent it in the following Json format, so that our system can convert it into an interactive object?  
{"Json Object": {
    "ObjectType": "<"Hotspot Image">",
    "ObjectName": "text",
     "AbstractParameter": 
{"_Picture_":"image_URL","_AltText_":"text","hotSpots":[{"_Xposition_":"Coordinate","_Yposition_":"Coordinate","_Header_":" text","_HotspotText_":"text","_HotspotText2_":"text"}]}
}

Important General Notes:
Note1: Please give each object an appropriate expressive name in the field "ObjectName", 
Note2: All Json fields are in the language of the book,
Note3:  Fill ALL the given fields of the Json (Do not use null/empty), 
Note4: in hotspots return important objects in the image
Note5: 
Image specific notes:  
1)	 "_AltText_" is a description of the image,
hotspot text is a description or info about this position

Object specific notes:
1)	The "_Coordinates_" are calculated as follows:
X= (x/ImageW) * 100
Y = (y/ImageH) * 100
return X, Y
Where:
ImageH = Height of the uploaded image
ImageW = Width of the uploaded image
`,

	"Image Blinder": `The uploaded image is a visual representation from an educational book or resource. It contains hidden parts (blurred, covered, or sequential elements) that reveal stages of a process or layers of information.

Your task is to extract and convert this image into an <"Category": "Illustrative Object"> of type <"typeName": "Image Blinder">, where each stage or part of the image is revealed sequentially. The goal is to help learners explore the image by uncovering one section at a time.

Please return the result in the following JSON format:

{
  "Json Object": {
    "ObjectType": "Image Blinder",
    "ObjectName": "TEXT",
    "AbstractParameter": {
      "_Title_": "TEXT",
      "Slides 2": [
        {
          "_Picture_": "CROPPED_IMAGE_URL",
          "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)",
          "_Label_": "TEXT",
          "_Description_": "TEXT",
          "_AltText_": "TEXT",
          "_HoverText_": "TEXT"
        }
        // ... repeat for all detected sections
      ]
    }
  }
}

x = zero-indexed offset from left edge / imageWidth
y = zero-indexed offset from top edge / imageHeight
w = width / imageWidth
h = height / imageHeight

Instructions:

Identify all visually distinct sections (e.g. each atom, molecule, step, labeled part).

Fill _AltText_ with a short description of the image section.

Fill _HoverText_ with the label or term that matches this section.

Fill _Label_ with a concise title of the section.

Fill _Description_ with a slightly more detailed description (e.g. what this part shows or its role in the process).

Do not include empty or null fields — describe each part thoroughly.

use the language of the uploaded image for all text content.

Please output the raw JSON only — do not add extra explanations or formatting outside the JSON
return compelete json
Please return JSON without embedding base64 image data. Instead, use external image URLs or placeholders like "https://example.com/image.jpg".

`,

"Image Juxtaposition": `
You are given an image that contains two or more distinct visual segments arranged side-by-side or top-to-bottom — commonly used in "Before and After" comparisons or multi-panel educational visuals.

Your task is to analyze the image and return a structured JSON object with the following fields:

{
  "Json Object": {
    "ObjectType": "Image Blinder",
    "ObjectName": "TEXT",
    "AbstractParameter": {
      "_Title_": "TEXT",
      "Slides 2": [
        {
          "_Picture_": "CROPPED_IMAGE_URL",
          "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)",
          "_Label_": "TEXT",
          "_Description_": "TEXT",
          "_AltText_": "TEXT",
          "_HoverText_": "TEXT"
        }
        // ... repeat for all detected sections
      ]
    }
  }
}

{
  "Json Object": {
    "ObjectType": "Image Juxtaposition",
    "ObjectName": "TEXT",
    "AbstractParameter": {
      "_Title_": "TEXT",
      "Slides 2": [
        {
          "_Picture_": "https://example.com/image1.jpg",
          "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)",

          "AltTextImage": "Scene Before Event",
          "HoverTextImage": "Before Event",
          "LabelImage": "BEFORE",
        },
        {
          "_Picture_": "https://example.com/image2.jpg",
          "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)",

          "AltTextImage": "Scene After Event",
          "HoverTextImage": "After Event",
          "LabelImage": "AFTER",

        }
    ]
}


"Heading": A descriptive title for the overall visual layout.

"slides": An array of objects where each object represents one image segment and includes:

"_Picture_": (Optional) a URL or description of the image segment


"AltTextImage": Alt text for accessibility

"HoverTextImage": Tooltip-style label

"LabelImage": Visible or inferred label in the image (e.g., "Before", "After")

x = zero-indexed offset from left edge / imageWidth
y = zero-indexed offset from top edge / imageHeight
w = width / imageWidth
h = height / imageHeight


Do not include empty or null fields — describe each part thoroughly.

use the language of the uploaded image for all text content.

Please output the raw JSON only — do not add extra explanations or formatting outside the JSON
Please return JSON without embedding base64 image data. Instead, use external image URLs or placeholders like "https://example.com/image.jpg".

`,

"Chart": `
For the uploaded image, this page image contains a few "Charts" or tables would you please represent each of it in a separate JSON format like the following: Note, please suggest filling in those missing fields:
{"ObjectType":"text", "ObjectName": "text",
"_GraphMode_": "text", "Data":[ { "_DataElementName_": "text",
"_Value_": "number", "_Color_": "hexa", "_FontColor_": "hexa" }
]}

use the language of the uploaded image for all text content.
in case of tables consider the values with time or date as the x-axis and the values as the y-axis.

Please output the raw JSON only — do not add extra explanations or formatting outside the JSON
`,

"Accordion": `You are given an image containing educational content in any language. Your task is to analyze the visible content and return a structured JSON object with the following format:


{
  "ObjectType": "text",
  "ObjectName": "<main topic name if detectable, or understand it from the context>",
  "ObjectJson": [
    {
      "_Title_": "<main heading or topic title>",
      "_SubTitle_": "<subtitle or secondary heading, if available>",
      "_SubsubTitle_": "<sub-subheading or section label, if available>",
      "_Text_": "<the main explanation, description, or bullet-point content>"
    }
  ]
}
Guidelines:

Use the language detected in the image — do not translate.

If subtitles or sub-subtitles are missing, return them as empty strings ("").

If multiple sections are found, return one object per section inside the ObjectJson array.

Preserve bullet points, numbering, and formatting in _Text_ as much as possible.

Output only valid raw JSON — no extra text or comments outside the JSON.
`,

"MCQ": `This image contains multiple-choice questions. Return each as:
{
 "ObjectType": "MCQ",
 "ObjectJson": {
"_Question_":"text",
  "Answers  2":
[{"_OptionText_":"text",
"_Correct_":"Bool"
"_ChosenFeedback_":"text",
"_notChosenFeedback_":"text",
"_Tip_":"text"}]}
}

_ChosenFeedback_ is why this answer is correct or why it is wrong
_notChosenFeedback_ is why this answer is wrong or why it is correct
_Tip_ is a tip to the user to help them answer the question
write all data in same language of the question
`,


"True False": `The uploaded image is a crop from a book page for a <”Category”: “Question”> of type <”typeName”: “True or False”> that asks to <”description”: “Determine if the following statement is True or False”>. It is required to represent it as an interactive object, hence, would you please represent it in the following Json format, so that our system can convert it into an interactive object.
Very important Notes:
Note1: Please give each object an appropriate expressive name in the field “ObjectName”,
Note2: All the Json fields must be in the same language of the book, 
Note3: fill ALL the given fields of the Json (do not use null/empty), but do not give the answer, only a clue, Note4: tips or helps cannot be the same as the answer, {“Json Object”: “ObjectType”: <”typeName”: “True or False”> “ObjectName”: “statement”, “AbstractParameter”: 
{"_Question_":"text", "_Correct_":Bool} }
Very specific notes: The field “_Question_” contains the statement to be evaluated. The field “_Correct_” contains the boolean value indicating if the statement is true (true) or false (false).
return respons with the image language

`,

"Mark the Word": `The uploaded image is a crop from a book page for a <”Category”: “Question”> of type <”typeName”: “Mark the Word”> that asks to <”description”: “Mark the correct word in the sentence”>.
It is required to represent it as an interactive object, hence, extract the question and the options and represent it in the following Json format, so that our system can convert it into an interactive object. 
Very important Notes:
Note1: Please give each object an appropriate expressive name in the field “ObjectName”,
Note2: All the Json fields must be in the same language of the book, 
Note3: fill ALL the given fields of the Json (do not use null/empty), but do not give the answer, only a clue, Note4: tips or helps cannot be the same as the answer, 
{“Json Object”: “ObjectType”: <”typeName”: “Mark the Word”> “ObjectName”: “text_marking”, “AbstractParameter”:
{"_TaskDescription_": "text", "Sentences": [ {“_Sentence_”: “text”, “_Answer_”: ”text”, “_RestSentence_”: ”text”, "_Options_": [
   "<option>",
       ...
 ],
 "help": "<help tipp>"
} ] } }
Very specific notes: 1) The field “_TaskDescription_” provides a general description of the task. 2) The array “Sentences” contains objects, where each object represents a sentence with: * “_Sentence_”: The part of the sentence before the word to be marked. * “_Answer_”: The correct word that should be marked. * “_RestSentence_”: The part of the sentence after the word to be marked.
"ObjectName" make it short and descriptive for the questions and in the same language of the book
`,

"Image MCQ": `  The uploaded image is a crop from a book page for a <”Category”: “Question”> of type <”typeName”: “Image MCQ”> that is  <”description”: “a Question that asks to Chose the proper image that represents the correct answer from multiple optional images”>.  It is required to represent it as an interactive object, hence, would you please represent it in the following Json format, so that our system can convert it into an interactive object.  
Very important Notes:
Note1: Please give each object an appropriate expressive name in the field “ObjectName”, 
Note2: All Json fields are in the language of the book,
Note3:  fill ALL the given fields of the Json (do not use null/empty), but do not give the answer, only a clue,
Note4: tips or helps cannot be the same as the answer,
Note5: suggest a correct answer,
Note6: Do not number the elements of the array as they will be randomly ordered,
Note7:  "_ChosenFeedback_" means a feedback comment if this answer is chosen, while "_notChosenFeedback_" means a feedback comment if this answer is not chosen.  Your suggested comments should take into consideration the correctness of the option (“_Correct_”)

{"Json Object": {
 "ObjectType": <"Image MCQ">,
 "ObjectName": "text",
  "AbstractParameter": 
{"_Question_":"text","Options2":[ {"Picture" :{"_Picture_":"image", "_NormalizedCoordinates_":"(x = X, y = Y, h = H, w = W)"}, "_AltText_":"text","_HoverText_":"text","_Correct_":"Bool"}]}
}}
Image specific notes:  
1)	 “_AltText_” is a description of the image,
2)	“_HoverText_” is a tip.
Object specific notes:
1)	You need to split the image into images each is an option, crop the image and save it, then provide its URL in the Json field “_Picture_”
2)	The “_NormalizedCoordinates_” are calculated as follows:
x: horizontal offset (from left) / total image width

y: vertical offset (from top) / total image height

w: width / total image width

h: height / total image height

Where:
x,y = block/cropped image vertex (up-left corner)
w= block/cropped image width
h= block/cropped image height
use the language of the uploaded image for all text content.

Please output the raw JSON only — do not add extra explanations or formatting outside the JSON
Please return JSON without embedding base64 image data. Instead, use external image URLs or placeholders like "https://example.com/image.jpg".

`,

"Text Drag Word": `The uploaded image is a crop from a book page for a <”Category”: “Question”> of type <”typeName”: “Text Drag Words”> that asks to <”description”: “Drag the Words into the appropriate box”>.  It is required to represent it as an interactive object, hence, would you please represent it in the following Json format, so that our system can convert it into an interactive object.  
Very important Notes:
Note1: Please give each object an appropriate expressive name in the field “ObjectName”, 
Note2: All the Json fields must be in the same language of the book,
Note3:  fill ALL the given fields of the Json (do not use null/empty), but do not give the answer, only a clue,
Note4: tips or helps cannot be the same as the answer,
{“Json Object”: 
“ObjectType” : <”typeName”: “Text Drag Words”>
“ObjectName”: “text”,
“AbstractParameter”: {"Sentences":[{"_Sentence_":"text"},{"_Answer_":"text"},{"_Tip_":"text"}],"Distractors":[{"_Distractor_":"text"}]}
}
Very specific notes: 
1)  For the array “Sentences”, divide the given text into sentences (“_Sentence_”) each has a single blank (“_Answer_”) at its end.  
2)  The field “_Answer_ contains the correct answer word for the given blank.
3)  The array “Distractors” contains words (“_Distractor_”) that can be placed as wrong answers put words in the same language of the book and related to the correct answer.

`,

"Fill in the Blank": `The uploaded image is a crop from a book page for a <”Category”: “Question”> of type <”typeName”: “Fill The Blanks”> that asks to <”description”: “Complete the sentence by filling in the blank with the most appropriate word”>.  It is required to represent it as an interactive object, hence, would you please represent it in the following Json format, so that our system can convert it into an interactive object.  
Very important Notes:
Note1: Please give each object an appropriate expressive name in the field “ObjectName”, 
Note2: All the Json fields must be in the same language of the book,
Note3:  fill ALL the given fields of the Json (do not use null/empty), but do not give the answer, only a clue,
Note4: tips or helps cannot be the same as the answer,
Note5: suggest a correct answer,
{“Json Object”: 
“ObjectType” : <”typeName”: “Fill The Blanks”>
“ObjectName”: “text”,
“AbstractParameter”: {"Questions":[{"_Question_":"text","_Answer_":"text","_Tip_":"text"}]}
}
Very specific note: for the array “Questions”, divide the sentence into questions (“_Question_”) each has a single blank (“_Answer_”) at its end.
`,

"Essay": `The uploaded image is a crop from a book page for a <”Category”: “Question”> of type <”typeName”: “essay”> that asks to <”description”: “An essay is a structured piece of writing that explores a topic through argument, analysis, or narrative”>.  It is required to represent it as an interactive object, hence, would you please represent it in the following Json format, so that our system can convert it into an interactive object.  
Very important Notes:
Note1: Please give each object an appropriate expressive name in the field “ObjectName”, 
Note2: All the Json fields must be in the same language of the book,
Note3:  fill ALL the given fields of the Json (do not use null/empty), but do not give the answer, only a clue,
Note4: tips or helps cannot be the same as the answer,
Note5: suggest a correct answer,


{“Json Object”: 
“ObjectType” : <”typeName”: “Essay”>
“ObjectName”: “text”,
“AbstractParameter”: {{"_EssayQuestion_": "text"}, {"_EssayModelAnswer_": "text"}, {"_Help_": "text"}}
`,


"Sort Paragraph": `The uploaded image is a crop from a book page for a <”Category”: “Question”> of type <”typeName”: “Sort paragraph”> that asks to <”description”: “Sort paragraph into the appropriate box”>.  It is required to represent it as an interactive object, hence, would you please represent it in the following Json format, so that our system can convert it into an interactive object.  
Very important Notes:
Note1: Please give each object an appropriate expressive name in the field “ObjectName”, 
Note2: All the Json fields must be in the same language of the book,
Note3:  fill ALL the given fields of the Json (do not use null/empty), but do not give the answer, only a clue,
Note4: tips or helps cannot be the same as the answer,
{“Json Object”: 
“ObjectType” : <”typeName”: “Sort paragraph”>
“ObjectName”: “text”,
“AbstractParameter”: {
{"TaskDescription":"text"}, 
"Paragraphs": 
[{"ParagraphText":"text"}]
}
Very specific notes: 
For the array “Paragraphs”, divide the given text into paragraphs (“ParagraphText”)

`,


};

module.exports = promptTemplates;
