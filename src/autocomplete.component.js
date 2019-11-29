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
    static get tag() {
        return "ac-input";
      }
    constructor() {
        super(); // always call super() first in the constructor.
        const url = "";
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
        <div id='container' class='autocomplete'>
            <input type='text' id='ac-input-text' />
            <div id='results'></div>
        </div>
      `;
    }

    ac_input_text_on_keyup(e){
        var self = e.target;
        fetch(this.dataset.url)
            .then(response => response.json())
            .then(data => {
                // Work with JSON data here
                console.log("data : " + data);
                if(document.getElementsByTagName("template").length>0){
                    [...document.getElementsByTagName("template")].forEach((template)=>{
                        console.log(template.content);
                        try{
                            const t = document.importNode(template.content, true);
                            
                            [...data].forEach((dataItem)=>{
                                console.log(dataItem);
                                self.shadowRoot.querySelector("#results").innerHTML+=(renderTemplate(t.textContent,dataItem));
                            });
                        }
                        catch(e)
                        {
                            console.log(e);
                        }
                    });
                }
                else{
                    console.log("No templates defined!");
                    /*No template no problem, we'll define our own!*/
                    [...data].forEach((dataItem)=>{
                        console.log(Reflect.get(dataItem,'id'));
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
        this.debounce = this.getAttribute('debounce');
        this.url = this.getAttribute('url');
        var el = this.shadowRoot.getElementById("ac-input-text");
        el.addEventListener("keyup", debounce(this.ac_input_text_on_keyup,500,this.getAttribute('url')));
        el.dataset.url = this.getAttribute('url');
        const results = this.shadowRoot.getElementById("results");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name + " " + oldValue + " " + newValue);
    }
};

customElements.define('ac-input', AutoCompleteComponent);
