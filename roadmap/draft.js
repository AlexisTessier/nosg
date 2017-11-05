// Generator: A function which create/remove files/directory
// Component: A part of a project, which share the same root directory. Can be made of one or multiple files, nested or not.
// Layer: A group of components, which have the same type of responsabilities in the project
// Components set: A group of components, classified into Layers


// nosg run-generator --generator='' --options="{name: hello, outputDirectory: out/path}" --sourcesDirectory="" --watch
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

//generator path
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
			components-set
			generator
			layer

			// these are for 
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
			generators
			layers