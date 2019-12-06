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
            <input type='text' id='ac-input-text' />
            <div id='results'></div>
        </div>
      `;
    }

    ac_list_item_selected(e){
        this.shadowRoot.getElementById('ac-input-text').value = e.target.innerText;
        if (typeof (this.onitemselected) == "function"){
                    
            this.onitemselected(e.target);
        }
    }

    ac_input_text_on_keyup(e){
        //e.preventDefault();
        let url = ''
        let res = this.shadowRoot.getElementById('results');
        if (!this.nokeyword){
            url = this.url + '?' + this.keyword + '=' + e.target.value;
            if (this.limit!=-1){
                url = url += '&' + this.limitkeyword + '=' + this.limit;
            }
            if (this.offset!=-1){
                url = url += '&' + this.offsetkeyword + '=' + this.offset;
            }
        }
        else
        {
            url = this.url;
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Work with JSON data here
                if(this.itemtemplate){
                    [...data].forEach((dataItem)=>{
                        res.innerHTML+=(renderTemplate(this.itemtemplate,dataItem));
                        res.lastChild.addEventListener('click', this.ac_list_item_selected);
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
                            res.appendChild(n);
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
        el.addEventListener("keyup", debounce(this.ac_input_text_on_keyup.bind(this),500));

        let r = this.shadowRoot.getElementById("results");
        r.addEventListener("click", this.ac_list_item_selected.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name + " " + oldValue + " " + newValue);
    }
};

customElements.define('ac-input', AutoCompleteComponent);
