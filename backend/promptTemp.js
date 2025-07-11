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
          "Photo": {
            "_Picture_": "CROPPED_IMAGE_URL",
            "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)"
          },
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
{"_Picture_":"image","_AltText_":"text","hotSpots":[{"_Xposition_":"Coordinate","_Yposition_":"Coordinate","_Header_":" text","_HotspotText_":"text","_HotspotText2_":"text"}]}
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
          "Photo": {
            "_Picture_": "CROPPED_IMAGE_URL",
            "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)"
          },
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

"Heading": A descriptive title for the overall visual layout.

"slides": An array of objects where each object represents one image segment and includes:

"Picture": (Optional) a URL or description of the image segment

"AltTextImage": Alt text for accessibility

"HoverTextImage": Tooltip-style label

"LabelImage": Visible or inferred label in the image (e.g., "Before", "After")

"_NormalizedCoordinates_": A bounding box for the segment with:

x: horizontal offset (from left) / total image width

y: vertical offset (from top) / total image height

w: width / total image width

h: height / total image height

Return the result as a clean JSON object in the format below:


{
  "Heading": "Before And After",
  "slides": [
    {
      "Picture": "https://example.com/image1.jpg",
      "AltTextImage": "Scene Before Event",
      "HoverTextImage": "Before Event",
      "LabelImage": "BEFORE",
      "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)"
    },
    {
      "Picture": "https://example.com/image2.jpg",
      "AltTextImage": "Scene After Event",
      "HoverTextImage": "After Event",
      "LabelImage": "AFTER",
      "_NormalizedCoordinates_": "(x = X, y = Y, h = H, w = W)"
    }
  ]
}
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


};

module.exports = promptTemplates;
