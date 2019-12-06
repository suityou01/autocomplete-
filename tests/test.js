import { AutoCompleteComponent } from "../src/autocomplete.component.js"
import { TestUtils } from "./testutils.js"

describe("Autocomplete Component", () => {
	var promisedData;

	beforeAll(function() {
		jasmine.clock().install();
	});

	beforeEach(function() {
		promisedData = [
			{
				"id": 1,
				"name": "Afghanistan"
			},
			{
				"id": 2,
				"name": "Albania"
			},
			{
				"id": 3,
				"name": "Algeria"  
			},
			{
				"id": 4,
				"name": "Andorra"
			},
			{
				"id": 5,
				"name": "Angola"
			},
			{
				"id": 6,
				"name": "Antigua and Barbuda"
			}
		];
	  });
	
	it("creates", async () => {
		const {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag);
		expect(shadowRoot).toBeTruthy();	
	})
	it("renders default html in the shadow root", async () => {
		const {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag);
		expect(shadowRoot.innerHTML.replace(/(\r\n|\n|\r)/gm,"").replace(/\s/g, "")).toEqual('<divid="container"class="autocomplete"><inputtype="text"id="ac-input-text"><divid="results"></div></div>');	
	});
	it("sets its default state correctly", async () => {
		const {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag);
		
		expect(shadowRoot.host.debounce).toEqual('500');
		expect(shadowRoot.host.url).toEqual("");
        expect(shadowRoot.host.keyword).toEqual("q");
        expect(shadowRoot.host.limit).toEqual('-1');
        expect(shadowRoot.host.limitkeyword).toEqual('limit');
        expect(shadowRoot.host.offset).toEqual('-1');
		expect(shadowRoot.host.offsetkeyword).toEqual('offset');
	});
	it("sets its configured state correctly", async () => {
		var {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 1000, url: 'http://test.com', keyword:"name", limit: 10, limitkeyword: 'max', offset: 100, offsetkeyword: 'startfrom'});
		expect(shadowRoot.host.debounce).toEqual('1000');
		expect(shadowRoot.host.url).toEqual("http://test.com");
        expect(shadowRoot.host.keyword).toEqual("name");
        expect(shadowRoot.host.limit).toEqual('10');
        expect(shadowRoot.host.limitkeyword).toEqual('max');
        expect(shadowRoot.host.offset).toEqual('100');
		expect(shadowRoot.host.offsetkeyword).toEqual('startfrom');
	});
	it("calls the REST api after the specified debounce period", async() => {
		/*Need to inject our template into the document*/
		let {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com'});
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		
		let el = shadowRoot.getElementById("ac-input-text");
		el.value = 'a';
		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);

		jasmine.clock().tick(501);
		expect(window.fetch).toHaveBeenCalledTimes(1);
	});
	it("calls the REST api after the specified debounce period with the query string containing the text content", async() => {
		
		/*Need to inject our template into the document*/
		let {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com'});
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		let el = shadowRoot.getElementById("ac-input-text");
		el.value = 'a';
		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);

		jasmine.clock().tick(501);

		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('http://test.com?q=a');
	});
	it("calls the REST api with the url only if nokeyword is set to true", async() => {
		let {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com', nokeyword: true});
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		let el = shadowRoot.getElementById("ac-input-text");
		el.value = 'a';
		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);

		jasmine.clock().tick(501);

		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('http://test.com');
	});
	it("calls the REST api with a limit and default limit keyword if the limit value is set", async() => {
		let {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com', limit: 10});
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		let el = shadowRoot.getElementById("ac-input-text");
		el.value = 'a';
		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);

		jasmine.clock().tick(501);

		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('http://test.com?q=a&limit=10');
	});
	it("calls the REST api with a limit and the limit keyword specified if both are set", async() => {
		let {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com', limit: 10, limitkeyword: 'max' });
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		let el = shadowRoot.getElementById("ac-input-text");
		el.value = 'a';
		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);

		jasmine.clock().tick(501);

		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('http://test.com?q=a&max=10');
	});
	it("calls the REST api with an offset using the default offset keyword if set", async() => {
		let {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com', offset: 100 });
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		let el = shadowRoot.getElementById("ac-input-text");
		el.value = 'a';
		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);

		jasmine.clock().tick(501);

		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('http://test.com?q=a&offset=100');
	});
	it("calls the REST api with an offset and default offset keyword if both values are set", async() => {
		let {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com', offset: 100, offsetkeyword: 'startfrom' });
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		let el = shadowRoot.getElementById("ac-input-text");
		el.value = 'a';
		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);

		jasmine.clock().tick(501);

		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('http://test.com?q=a&startfrom=100');
	});
	it("calls the REST api and builds the result set in the display section using a default template", async() => {
		let component = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com'});
		component.onlistdisplayed = function(component, data){ 
			r = component.shadowRoot.getElementById('results');
			expect(data.length).toEqual(6);
			expect(component.shadowRoot.getElementById('results').childNodes.length).toEqual(6);
			let i = 1;
			[...r.childNodes].forEach((node)=>
			{
				expect(node.id).toEqual(i.toString());
				expect(node.innerText).toEqual(data[i-1].name);
				expect(node.className).toEqual('resultItem');
				i++;
			});
		};
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		spyOn(component, 'ac_input_text_on_keyup');
		
		let el = component.shadowRoot.getElementById("ac-input-text");
		let r = component.shadowRoot.getElementById("results");
		el.addEventListener('keyup', component.ac_input_text_on_keyup);
		el.value = 'a';

		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);
		jasmine.clock().tick(501);
		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(component.ac_input_text_on_keyup).toHaveBeenCalledTimes(1);
	})
	it("calls the REST api and builds the result set in the display section using the supplied template", async()=>{
		let component = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com', itemtemplate: "<div class='testresultitem' id='${id}'>${name}</div>" });
		component.onlistdisplayed = function(component, data){ 
			r = component.shadowRoot.getElementById('results');
			expect(data.length).toEqual(6);
			expect(component.shadowRoot.getElementById('results').childNodes.length).toEqual(6);
			let i = 1;
			[...r.childNodes].forEach((node)=>
			{
				expect(node.id).toEqual(i.toString());
				expect(node.innerText).toEqual(data[i-1].name);
				expect(node.className).toEqual('testresultitem');
				i++;
			});
		};
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		spyOn(component, 'ac_input_text_on_keyup');
		
		let el = component.shadowRoot.getElementById("ac-input-text");
		let r = component.shadowRoot.getElementById("results");
		el.addEventListener('keyup', component.ac_input_text_on_keyup);
		el.value = 'a';

		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);
		jasmine.clock().tick(501);
		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(component.ac_input_text_on_keyup).toHaveBeenCalledTimes(1);
	});
	it("adds the selected autocomplete item to the text box when the user clicks on in", async()=>{
		let component = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com' });
		component.onlistdisplayed = function(component, data){ 
			r = component.shadowRoot.getElementById('results');
			let c = new MouseEvent('click', {'button': 0});
			
			/*Choose element at random*/
			var item = r.childNodes[Math.floor(Math.random()*r.childNodes.length)];
			Object.defineProperties(c, { target : { writable: false, value : item}});
			
			item.dispatchEvent(c);
			
		};
		
		component.onitemselected = function(e){
			expect(this.shadowRoot.getElementById('ac-input-text').value).toEqual(e.innerText);
		};

		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		spyOn(component, 'ac_input_text_on_keyup');
		
		let el = component.shadowRoot.getElementById("ac-input-text");
		let r = component.shadowRoot.getElementById("results");
		el.addEventListener('keyup', component.ac_input_text_on_keyup);
		el.value = 'a';

		let keydown = new KeyboardEvent('keydown',{'key':'a'});
		Object.defineProperties(keydown, { target : { writable: false, value : el}});
		let keyup = new KeyboardEvent('keyup',{'key':'a'});
		Object.defineProperties(keyup, { target : { writable: false, value : el}});
		el.dispatchEvent(keydown);
		el.dispatchEvent(keyup);
		jasmine.clock().tick(501);
		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(component.ac_input_text_on_keyup).toHaveBeenCalledTimes(1);
	});
});
