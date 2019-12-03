"use strict"

const debounce = (fn, time) => {
    let timeout;
  
    return function() {
      const functionCall = () => fn.apply(this, arguments);
      
      clearTimeout(timeout);
      timeout = setTimeout(functionCall, time);
    }
}

function renderTemplate(template, item) {
    console.log(item.name);
    //const pattern = /{\s*(\w+?)\s*}/g; // {property}
    //return template.replace(pattern, (_, token) => data[token] || '');
    return eval(template);
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

    ac_input_text_on_keyup(e){
        e.preventDefault();
        fetch(this.url)
            .then(response => response.json())
            .then(data => {
                // Work with JSON data here
                if(document.getElementsByTagName("template").length>0){
                    [...document.getElementsByTagName("template")].forEach((template)=>{
                        try{
                            const t = document.importNode(template.content, true);
                            
                            [...data].forEach((dataItem)=>{
                                this.shadowRoot.querySelector("#results").innerHTML+=(renderTemplate(t.textContent,dataItem));
                            });
                        }
                        catch(e)
                        {
                            console.log(e);
                        }
                    });
                }
                else{
                    var res = this.getElementById('results');
                    /*No template no problem, we'll define our own!*/
                    [...data].forEach((dataItem)=>{
                        var n = document.createElement("div");
                        n.className="resultItem";
                        n.id = Reflect.get(dataItem,'id');
                        n.appendChild(document.createTextNode(Reflect.get(dataItem,'name')));
                        res.appendChild(n);
                        /*Should now be able to get a value of the id and the value fields names and reflect them from the data item*/
                        //self.shadowRoot.querySelector("#results").innerHTML+=(renderTemplate(t.textContent,dataItem));
                    });
                }
            })
            .catch(err => {
                // Do something for an error here
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
            this.setAttribute('limit', '-1');
        if (!this.hasAttribute('limitkeyword'))
            this.setAttribute('limitkeyword', 'limit');
        if (!this.hasAttribute('offset'))
            this.setAttribute('offset', '-1');
        if (!this.hasAttribute('offsetkeyword'))
            this.setAttribute('offsetkeyword', 'offset');
        let el = this.shadowRoot.getElementById("ac-input-text");
        el.addEventListener("keyup", debounce(this.ac_input_text_on_keyup.bind(this),500));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name + " " + oldValue + " " + newValue);
    }
};

customElements.define('ac-input', AutoCompleteComponent);
