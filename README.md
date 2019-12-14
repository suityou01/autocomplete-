# autocomplete-
Lightweight HTML 5 autocomplete Web component with REST Integration and templating

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Description

A lightweight vanilla javascript web component for single and multi select auto complete with JSON REST api sources and HTML templating.

## Table of Contents

Contents |
---------|
[Attributes](#attributes)|
[Properties](#properties)|
[Events](#events)|
[Styles](#styles)|
[Installation](#installation)|
[Usage](#usage)|

## Attributes

Attribute | Meaning | Default | Example
----------|---------|---------|--------
debounce|The short delay between a key press and calling the rest api|500ms| `<ac-input debounce=2000 url='https://restcountries.eu/rest/v2/name/'></ac-input>`
itemtemplate|The html template to use for autocomplete items||`<ac-input url='https://restcountries.eu/rest/v2/name/' itemtemplate="<div class='resultItem' id='${id}'><i>${name}</i></div>"></ac-input>` **NB** *The template performs string interpolation using a single moustache, reflecting the (destructured if subitem is set) items from the returned data array returned from the REST api. By using a single moustache this should fly below the radar of any third party tools such as mustache.js* 
keyword|The keyword to be supplied as part of the querystring to the REST api with the user input|q|`<ac-input url='https://restcountries.eu/rest/v2' keyword='widget'></ac-input>` will query `https://restcountries.eu/rest/v2?`**widget=**`whatevertheuserentered` 
limit|The limit value to supply to the REST api to limit the number of records returned|-1| `<ac-input url='https://restcountries.eu/rest/v2/name/' limit=25></ac-input>` will query `https://restcountries.eu/rest/v2?q=whatevertheuserentered`**&limit=25** **NB** *The default value of **q** is used for the keyword and the default value of **limit** is used for the limit predicate in the querystring*  
limitkeyword|The value for the name of the limit predicate to be supplied to the REST api|limit|`<ac-input url='https://restcountries.eu/rest/v2/name/' limitkeyword='max' limit=25></ac-input>` will query `https://restcountries.eu/rest/v2?q=whatevertheuserentered`**&max=25**
multiselect|Puts the component in multiselect mode||`<ac-input url='https://restcountries.eu/rest/v2/name/' multiselect></ac-input>`
nokeyword|Specified that no querystring is to be supplied||`<ac-input url='https://restcountries.eu/rest/v2/' nokeyword></ac-input>` will query `https://restcountries.eu/rest/v2/` 
offset|The value for the pagination offset predicate to be supplued to the REST api|-1|`<ac-input url='https://restcountries.eu/rest/v2/name/' offset=25></ac-input>` will query `https://restcountries.eu/rest/v2?q=whatevertheuserentered`**&offset=25** **NB** *The default value of **q** is used for the keyword and the default value of **offset** is used for the offset predicate in the querystring*
offsetkeyword|The value for the name of the offset predicate to be supplied to the REST api|offset|`<ac-input url='https://restcountries.eu/rest/v2/name/' offsetkeyword='startfrom' limit=25></ac-input>` will query `https://restcountries.eu/rest/v2?q=whatevertheuserentered`**&startfrom=25**
placeholder|The value for the text placeholder||`<ac-input url='https://restcountries.eu/rest/v2/name/' placeholder='Please select a user'></ac-input>`
width|The width of the component's container||`<ac-input url='https://restcountries.eu/rest/v2/name/' width='50%'></ac-input>`
subitem|Used to destructure the array returned from the REST api||`<ac-input url='https://restcountries.eu/rest/v2/name/' subitem='data.subitem.subsubitem'></ac-input>` will return the array of items 3 levels deep **e.g. payload.data.subitem.subsubitem.items**
url|The url of the REST api that will supply the autocomplete data|| `<ac-input url='https://restcountries.eu/rest/v2/name/'></ac-input>`

## Properties
Property|Meaning|Example
--------|-------|-------
tag|The tag name|Returns "ac-input"
selectedItems|The selected items|Returns an array of key value pairs for the selected item(s)

## Events
Event | Meaning | Example
------|---------|--------
onlistdisplayed(component,data)|The custom user event, if supplied, that will fire when the component displays a list of autocomplete suggestions after the debounce period| `component.onlistdisplayed = function(component, data){ console.log(component + ' ' + data);};`
onitemselected(item)|The custom user event, if supplied, that will fire when a user clicks on an item in the autocomplete suggestion list|`component.onitemselected = function(item){ console.log(item); };`
onblur(component, event)|The custom user event, if supplied, that will fire when the component loses focus|`component.onblur = function(component,event){console.log(component + ' ' + event);};`

## Styles
### ul 
#### Styles the selected items
```css
ul{
    display: block;
    list-style-type: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 40px;
}
```

### Selection section
#### The container styles for the selected item section 
```css
.selection-section{ 
    border: 1px solid #eee;
    display: flex;
    flex-direction: row;
}
```

### Results section
#### The container styles for the auto complete results section
```css
.results-section{
    display: flex;
    flex-direction: column;
}
.resultItem:hover{
    background-color: aliceblue;
    font-weight: bold;
    border: 0.1px solid #eee;
}
#results{
    border: 0.5px dashed lightgray;
    white-space: nowrap;
    display: flex !important;
    flex-direction: column;
    position: absolute;
    background-color: #ffffff;
}
```

### Flexlist
#### Styling for the selected items stored in the ul
```css
.flexlist{
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
    cursor: text;
    background-color: #ffffff;
}

.flexlist li.value {
    display: inline-block;
    padding: 2px 25px 2px 7px;
    background: #eee;
    border-radius: 3px;
    color: #777;
    line-height: 20px;
}
          
.flexlist li {
    display: inline-block;
    position: relative;
    margin: 5px;
    float: left;
}
```

### .flexdatalist
#### Styling for the selected items stored in the ul
```css 
    :before {
        content: '';
        display: block;
        clear: both;
    }
```

### Cancel search button
#### Styling for the cancel search button
```css
.cancelsearch {
    border-radius: 50%;
    border: 2px solid gray;
    background-color: transparent;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    position:absolute;
    top: 2px;
    color: #666;
    font-size: small;
}
.cancelsearch:hover {
    background-color: gray;
    color: whitesmoke;
}
```

### Editor
#### Styling for the text input field for user search terms
```css
.editor{
    width: 100%;
    float: left;
    line-height: 25px;
    overflow-x: hidden;
    white-space: nowrap;
    padding: 3px;
}

.editor:focus{
    outline:none;
}

/*Placeholder styles*/
.editor:empty:not(:focus):before{
    content:attr(data-text);
    color: lightgray;
    margin-left: 3px;
}

```

### Remove item
#### Styling for the remove item button (multiselect mode only)
```css
span.removeitem {
    font-weight: 700;
    padding: 2px 5px;
    font-size: 10px;
    line-height: 20px;
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    opacity: 0.30;
}
```

## Installation
Add as a javascript module to your web page
`<script type="module" src="src/autocomplete.component.js"></script>`

Or import from CDN
`<script type="module" src="http://charliebenger.com/src/webcomponents/autocomplete/1.0.0/autocomplete.component.js"></script>`

## Usage
### Simple mode with no querystring
`<ac-input url='https://restcountries.eu/rest/v2/name/' width='250px' nokeyword=true placeholder='Select country' ></ac-input>`

### Multiselect mode with no querystring
`<ac-input url='https://restcountries.eu/rest/v2/name/' width='250px' nokeyword=true placeholder='Select country' multiselect=true></ac-input>`

### Simple mode with item template, placeholder text and no querystring
`<ac-input url='https://restcountries.eu/rest/v2/name/' width='250px' nokeyword=true placeholder='Select country' itemtemplate="<div class='resultItem' id='${id}'><i>${name}</i></div>"></ac-input>`

### Multiple mode with item template with placeholder text and no querystring
`<ac-input url='https://reqres.in/api/users?page=2' width='250px' nokeyword=true subitem=data placeholder='Select user' multiselect itemtemplate="<div class='resultItem' id='${id}'><img src='${avatar}' style='border-radius:50%; width:50px; height:50px;'/>${email}</div>"></ac-input>`