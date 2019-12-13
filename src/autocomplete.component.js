"use strict"

const regex = /\${[^{]+}/g;

function interpolate(template, variables, fallback) {
    return template.replace(regex, (match) => {
        const path = match.slice(2, -1).trim();
        return getObjPath(path, variables, fallback);
    });
}

//get the specified property or nested property of an object
function getObjPath(path, obj, fallback = '') {
    return path.split('.').reduce((res, key) => res[key] || fallback, obj);
}

const debounce = (fn, time) => {
    let timeout;
  
    return function() {
      const functionCall = () => fn.apply(this, arguments);
      
      clearTimeout(timeout);
      timeout = setTimeout(functionCall, time);
    }
}

function renderTemplate(template, item) {
    return interpolate(template,item,"??");
}

export class AutoCompleteComponent extends HTMLElement {
    get debounce(){
        return this.getAttribute('debounce');
    }
    set debounce(val) {
        if (val) {
            this.setAttribute('debounce', val);
        } else {
            this.setAttribute('debounce', '500');
        }
    }
    get url(){
        return this.getAttribute('url');
    }
    set url(val){
        if (val) {
            this.setAttribute('url', val);
        } else {
            this.setAttribute('url', '');
        }
    }
    get keyword(){
        return this.getAttribute('keyword');
    }
    set keyword(val){
        if (val) {
            this.setAttribute('keyword', val);
        } else {
            this.setAttribute('keyword', 'q');
        }
    }
    get limit()
    {
        return this.getAttribute('limit');
    }
    set limit(val){
        if (val) {
            this.setAttribute('limit', val);
        } else {
            this.setAttribute('limit', '-1');
        }
    }
    get limitkeyword(){
        return this.getAttribute('limitkeyword');
    }
    set limitkeyword(val){
        if (val) {
            this.setAttribute('limitkeyword', val);
        } else {
            this.setAttribute('limitkeyword', 'max');
        }
    }
    get offset(){
        return this.getAttribute('offset');
    }
    set offset(val){
        if (val) {
            this.setAttribute('offset', val);
        } else {
            this.setAttribute('offset', '-1');
        }
    }
    get offsetkeyword(){
        return this.getAttribute('offsetkeyword');
    }
    set offsetkeyword(val){
        if (val) {
            this.setAttribute('offsetkeyword', val);
        } else {
            this.setAttribute('offsetkeyword', 'startfrom');
        }
    }
    get nokeyword(){
        return this.getAttribute('nokeyword') || false;
    }
    set nokeyword(val){
        if(val) {
            this.setAttribute('nokeyword', val);
        } else
        {
            this.setAttribute('nokeyword', false);
        }
    }
    get multiselect(){
        return this.hasAttribute('multiselect') || false;
    }
    get onlistdisplayed()
    {
        return this._onlistdisplayed;
    }
    set onlistdisplayed(val)
    {
        if(val && typeof val=="function"){
            this._onlistdisplayed= val;
        }
    }
    get onitemselected()
    {
        return this._onitemselected;
    }
    set onitemselected(val)
    {
        if(val && typeof val=="function"){
            this._onitemselected= val;
        }
    }
    get onblur()
    {
        return this._onblur;
    }
    set onblur(val)
    {
        if(val && typeof val=="function"){
            this._onblur= val;
        }
    }
    get itemtemplate()
    {
        return this.getAttribute('itemtemplate') || null;
    }
    static get tag() {
        return "ac-input";
    }    
    
    get selectedItems()
    {
        items=[];
        [...this._listitems].forEach((item)=>{
            items.push({id: item.id, value: item.getElementsByClassName("itemvalue")[0]});
        });
        return items;
    }

    constructor() {
        super(); // always call super() first in the constructor.
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
        <div id='container'>
            <div class='selection-section'>
                <ul id='ac-input-list' class='flexlist'>
                    <li>
                        <div id='ac-input-text' class='editor' contenteditable></div>
                    </li>
                    <li>
                        <button id='cancel-button' class='cancelsearch'>x</button>
                    </li>
                </ul>
            </div>
            <div class='results-section'>
                <div id='results'></div>
            </div>
        </div>
        `;
        this._container = shadowRoot.getElementById('container');
        this._results = shadowRoot.getElementById('results'); 
        this._editor = shadowRoot.getElementById('ac-input-text');
        this._cancelbutton = shadowRoot.getElementById('cancel-button');
        this._listitems = shadowRoot.getElementById("ac-input-list");
        let style = document.createElement('style');
        style.textContent = `
        ul {
            display: block;
            list-style-type: disc;
            margin-block-start: 1em;
            margin-block-end: 1em;
            margin-inline-start: 0px;
            margin-inline-end: 0px;
            padding-inline-start: 40px;
          }
          
          .selection-section{
            border: 1px solid #eee;
            display: flex;
            flex-direction: row;
          }

          .results-section{
            display: flex;
            flex-direction: column;
          }
          
          .flexlist{
            width: 100%;
            margin: 0;
            padding: 0;
            list-style: none;
            text-align: left;
            cursor: text;
            background-color: #ffffff;
          }
          
          .flexdatalist:before {
            content: '';
            display: block;
            clear: both;
          }
          
          .flexlist li.value {
            display: inline-block;
            padding: 2px 25px 2px 7px;
            background: #eee;
            border-radius: 3px;
            color: #777;
            line-height: 20px;
            /*position: absolute;*/
          }
          
          .flexlist li {
            display: inline-block;
            position: relative;
            margin: 5px;
            float: left;
          }
          
          .editor{
            /*border: .1px solid #eee;*/
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

          .editor:empty:not(:focus):before{
            content:attr(data-text);
            color: lightgray;
            margin-left: 3px;
          }

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

         .cancelsearch {
            border-radius: 50%;
            border: 2px solid gray;
            background-color: transparent;
            text-align: center;
            text-decoration: none;
            vertical-align: middle;
            position:absolute;
            top: 2px;
            /*right: 3px;*/
            color: #666;
            font-size: small;
        }

        .cancelsearch:hover {
            background-color: gray;
            color: whitesmoke;
        }
        `;
        shadowRoot.appendChild(style);
        this.ac_results_visible(false);
        this.cancel_button_visible(false);
    }

    ac_input_text_on_blur(e){
        /*Firstly as someone clicked off our component we have to hide the results and empty them*/
        this.shadowRoot.getElementById('results').innerHTML = "";
        if (typeof (this.onblur) == "function"){
                    
            this.onblur(this, e);
        }
    }

    ac_add_list_item(e){
        e.preventDefault();
        let el = this.shadowRoot.getElementById('ac-input-list');
        let li = document.createElement('li');
        let s = document.createElement('span');
        s.className="itemvalue";
        li.className = 'value';
        s.innerText = e.target.innerText;
        let sc = document.createElement('span');
        sc.className='removeitem';
        sc.innerText = 'x';
        sc.addEventListener('click',this.ac_remove_list_item.bind(this));
        li.id= e.target.id;
        li.appendChild(s);
        li.appendChild(sc);
        el.insertBefore(li,this._editor.parentNode);
        this.ac_reset_editor();
    }

    ac_remove_list_item(e)
    {
        e.preventDefault();
        let id = e.target.parentNode.id;
        let el = this.shadowRoot.getElementById('ac-input-list');
        let li = Node;
        [...el.getElementsByClassName("value")].forEach((item)=>{
            if (item.id = id){
                li = item;
            }
        });
        el.removeChild(li);
    }

    ac_reset_editor(){
        this._editor.innerText='';
    }

    ac_list_item_selected(e){
        e.preventDefault();
        if(this.multiselect){
            this.ac_add_list_item(e);
        }
        else
        {
            this.shadowRoot.getElementById('ac-input-text').textContent = e.target.innerText;
            this.cancel_button_visible(true);
        }
        this._results.innerHTML = '';
        this.ac_results_visible(false);
        
        if (typeof (this.onitemselected) == "function"){
                        
            this.onitemselected(e.target);
        }
    }

    ac_results_visible(visibility)
    {
        if(typeof(visibility)=="boolean"){
            (visibility)?(this._results.style.display = 'block'):(this._results.style.display = 'none');
        }
    }
    cancel_button_visible(visibility)
    {
        if(typeof(visibility)=="boolean"){
            (visibility)?(this._cancelbutton.style.display = 'block'):(this._cancelbutton.style.display = 'none');
        }
    }
    cancel_button_click(e){
        this._results.innerHTML = "";
        this.ac_results_visible(false);
        this._editor.textContent = "";
        this.cancel_button_visible(false);
    }
    ac_input_text_on_keyup(e){
        let url = '';
        this._results.innerHTML= '';

        if(this._editor.textContent=='')
        {
            return;
        }
        else
        {
            this.ac_results_visible(true);
        }
        
        if (!this.nokeyword){
            url = this.url + '?' + this.keyword + '=' + this._editor.textContent;
            if (this.limit!=-1){
                url = url += '&' + this.limitkeyword + '=' + this.limit;
            }
            if (this.offset!=-1){
                url = url += '&' + this.offsetkeyword + '=' + this.offset;
            }
        }
        else
        {
            url = this.url + this._editor.textContent;
        }
        try
        {
        fetch(url)
            .then(response => {
                if(!response.ok){
                    this._results.innerHTML="<b style='color:#FF0000'>Endpoint not available</b>"; 
                    if (typeof (this.onlistdisplayed) == "function"){
                    
                        this.onlistdisplayed(this, null);
                    }
                    throw new Error('Endpoint not available');
                }
                return response.json();
            })
            .then(data => {
                // Work with JSON data here
                let dataItems = null;
                if(this.hasAttribute('subitem')){
                    dataItems = Reflect.get(data,this.getAttribute('subitem'));
                }
                else
                {
                    dataItems = data;
                }
                if(this.itemtemplate){
                    [...dataItems].forEach((dataItem)=>{
                        let e = document.createElement("template");
                        e.innerHTML = renderTemplate(this.itemtemplate,dataItem);
                        e.content.firstChild.addEventListener('click', this.ac_list_item_selected.bind(this));
                        e.id = e.id || this._results.childNodes.length;
                        this._results.appendChild(e.content.firstChild);
                    });
                }
                else{
                    try{
                        /*No template no problem, we'll define our own!*/
                        [...dataItems].forEach((dataItem)=>{
                            var n = document.createElement("div");
                            n.addEventListener('click', this.ac_list_item_selected.bind(this));
                            n.className="resultItem";
                            n.id = Reflect.get(dataItem,'id') || this._results.childNodes.length + 1;
                            n.appendChild(document.createTextNode(Reflect.get(dataItem,'name')));
                            this._results.appendChild(n);
                        });
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                }
              
                if (typeof (this.onlistdisplayed) == "function"){
                    
                    this.onlistdisplayed(this, data);
                }
            })
            .catch(err => {
                // Do something for an error here
                console.log(err);
            });
        }
        catch(e){
            res.innerHTML="<b style='color:#FF0000'>Autocomplete component suffered an error. Specific error message was '" + e + "'</b>"; 
            if (typeof (this.onlistdisplayed) == "function"){
                    
                this.onlistdisplayed(this, null);
            }
        }
    }

    connectedCallback() {
        if (!this.hasAttribute('debounce'))
            this.setAttribute('debounce', '500');
        if (!this.hasAttribute('url'))
            this.setAttribute('url', '');
        if (!this.hasAttribute('keyword'))
            this.setAttribute('keyword', 'q');
        if (!this.hasAttribute('limit'))
            this.setAttribute('limit', -1);
        if (!this.hasAttribute('limitkeyword'))
            this.setAttribute('limitkeyword', 'limit');
        if (!this.hasAttribute('offset'))
            this.setAttribute('offset', -1);
        if (!this.hasAttribute('offsetkeyword'))
            this.setAttribute('offsetkeyword', 'offset');
        if (this.hasAttribute('placeholder'))
            this._editor.setAttribute('data-text', this.getAttribute('placeholder'));
        
        this._editor.addEventListener("keyup", debounce(this.ac_input_text_on_keyup.bind(this),500));
        this._editor.blur = this.ac_input_text_on_blur.bind(this);

        if (this.hasAttribute('width'))
        {
            //this._editor.style.width = this.getAttribute('width');
            this._results.style.width = this.getAttribute('width');
            this._container.style.width = this.getAttribute('width');
        }

        //this._results.addEventListener("click", this.ac_list_item_selected.bind(this));
        this._cancelbutton.addEventListener("click", this.cancel_button_click.bind(this));
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name + " " + oldValue + " " + newValue);
    }
};

customElements.define('ac-input', AutoCompleteComponent);
