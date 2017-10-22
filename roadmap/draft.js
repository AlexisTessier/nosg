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

//generator name
view

//component path
nosg/generators/view
generators/view

//deep nesting => if more than 3 url fragments
nosg/generators/view/nested/view/component

sources://source directory
	main://components set
	nosg://components set
		generators://layer
			generator
			layer
			generic
			asset
			setting
			tool
			view
			model
			view-model
			request
			action
			-----
			data
			option
			widget
			node
			end-point
		layers://layer