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
});
