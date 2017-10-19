// nosg run-generator --generator='' --options="{name: hello, outputDirectory: out/path}" --sourcesDirectory=""
// nosg create-component --layer --name --outputDirectory --sourcesDirectory=""
// nosg init --name
// nosg config
// nosg env
// nosg alias
// nosg create-component-set
// nosg use-component-set
// nosg update-component-set
// nosg remove-component-set
// nosg lint

const layer = {
	createComponentGenerator:createComponentGenerator
}