import { AutoCompleteComponent } from "../src/autocomplete.component.js"
import { TestUtils } from "./testutils.js"

describe("Autocomplete Component", () => {
	var promisedData;
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
	
	it("It creates", async () => {
		const {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag);
		expect(shadowRoot).toBeTruthy();	
	})
	it("It renders default html in the shadow root", async () => {
		const {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag);
		expect(shadowRoot.innerHTML.replace(/(\r\n|\n|\r)/gm,"").replace(/\s/g, "")).toEqual('<divid="container"class="autocomplete"><inputtype="text"id="ac-input-text"data-url="null"><divid="results"></div></div>');	
	})
	it("It calls the REST api after the specified debounce period", async() => {
		jasmine.clock().install();
		/*Need to inject our template into the document*/
		var {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag, { debounce: 500, url: 'http://test.com'});
		spyOn(window, 'fetch').and.returnValue(Promise.resolve({ json: () => Promise.resolve(promisedData)}));
		
		var el = shadowRoot.getElementById("ac-input-text");
		el.dispatchEvent(new KeyboardEvent('keydown',{'key':'a', 'bubbles': true, 'cancelable': true, 'target': el}));
		el.dispatchEvent(new KeyboardEvent('keyup',{'key':'a','bubbles': true, 'cancelable': true, 'target': el}));
		jasmine.clock().tick(501);
		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('http://test.com');
		var res = shadowRoot.getElementById("results");
		console.log(res);
	});
});
