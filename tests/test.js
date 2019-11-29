import { AutoCompleteComponent } from "../src/autocomplete.component.js"
import { TestUtils } from "./testutils.js"

describe("Autocomplete Component", () => {
	it("It creates", async () => {
		const {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag);
		expect(shadowRoot).toBeTruthy();	
	})
	it("It renders default html in the shadow root", async () => {
		const {shadowRoot} = await TestUtils.render(AutoCompleteComponent.tag);
		console.log(shadowRoot.innerHTML);
		expect(shadowRoot.innerHTML.replace(/(\r\n|\n|\r)/gm,"").replace(/\s/g, "")).toEqual('<divid="container"class="autocomplete"><inputtype="text"id="ac-input-text"><divid="results"></div></div>');	
	})
});
