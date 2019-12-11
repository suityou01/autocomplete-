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
    
    constructor() {
        super(); // always call super() first in the constructor.
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
        <div id='container' class='autocomplete'>
            <ul id='ac-input-list' class='flexlist'>
                <li>
                    <div id='ac-input-text' class='editor' contenteditable></div>
                    <button id='cancel-button' class='cancelsearch'>x</button>
                </li>
            </ul>
            <div id='results'></div>
        </div>
        `;
        this._results = shadowRoot.getElementById('results'); 
        this._editor = shadowRoot.getElementById('ac-input-text');
        this._cancelbutton = shadowRoot.getElementById('cancel-button');
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
          
          #container{
            /*border: 1px solid #eee;*/
            display: flex;
            flex-direction: column;
            width: 250px;
          }
          
          .flexlist{
            width: 100%;
            margin: 0;
            padding: 0;
            list-style: none;
            text-align: left;
            cursor: text;
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
          }
          
          .flexlist li {
            display: inline-block;
            position: relative;
            margin: 5px;
            float: left;
          }
          
          .editor{
            border: .1px solid #eee;
            width: 50px;
            float: left;
            line-height: 25px;
            /*overflow-x: scroll;*/
            white-space: nowrap;
          }

          #editor:focus{
            outline:none;
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
            right: 3px;
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
        let el = this.shadowRoot.getElementById('ac-input-list');
        let li = document.createElement('li');
        let s = document.createElement('span');
        s.className = 'value';
        s.innerText = e.target.innerText;
        let sc = document.createElement('span');
        sc.className='removeitem';
        sc.innerText = 'x';
        li.id= e.target.id;
        li.appendChild(s);
        li.appendChild(sc);
        el.appendChild(li);
    }

    ac_remove_list_item(e)
    {
        let el = this.shadowRoot.getElementById('ac-input-list');
        let li = el.getElementById(e.target.id);
        el.removeChild(li);
    }

    ac_list_item_selected(e){
        if(this.multiselect){
            this.ac_add_list_item(e);
        }
        else
        {
            this.shadowRoot.getElementById('ac-input-text').textContent = e.target.innerText;
        }
        this._results.innerHTML = '';
        this.ac_results_visible(false);
        this.cancel_button_visible(true);
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
    ac_input_text_on_keyup(e){
        let url = '';
        this._results.innerHTML= '';

        if(this.shadowRoot.getElementById('ac-input-text').textContent=='')
        {
            return;
        }
        else
        {
            this.ac_results_visible(true);
        }
        
        if (!this.nokeyword){
            url = this.url + '?' + this.keyword + '=' + this.shadowRoot.getElementById('ac-input-text').textContent;
            if (this.limit!=-1){
                url = url += '&' + this.limitkeyword + '=' + this.limit;
            }
            if (this.offset!=-1){
                url = url += '&' + this.offsetkeyword + '=' + this.offset;
            }
        }
        else
        {
            url = this.url + this.shadowRoot.getElementById('ac-input-text').textContent;
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
                if(this.itemtemplate){
                    [...data].forEach((dataItem)=>{
                        this._results.innerHTML+=(renderTemplate(this.itemtemplate,dataItem));
                        this._results.lastChild.addEventListener('click', this.ac_list_item_selected);
                    });
                }
                else{
                    try{
                        /*No template no problem, we'll define our own!*/
                        [...data].forEach((dataItem)=>{
                            var n = document.createElement("div");
                            n.addEventListener('click', this.ac_list_item_selected.bind(this));
                            n.className="resultItem";
                            n.id = Reflect.get(dataItem,'id');
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
        
        let el = this.shadowRoot.getElementById("ac-input-text");
        let res = this.shadowRoot.getElementById("results");
        el.addEventListener("keyup", debounce(this.ac_input_text_on_keyup.bind(this),500));
        el.blur = this.ac_input_text_on_blur.bind(this);

        if (this.hasAttribute('width'))
        {
            el.style.width = this.getAttribute('width');
            res.style.width = this.getAttribute('width');
        }

        let r = this.shadowRoot.getElementById("results");
        r.addEventListener("click", this.ac_list_item_selected.bind(this));
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name + " " + oldValue + " " + newValue);
    }
};

customElements.define('ac-input', AutoCompleteComponent);
