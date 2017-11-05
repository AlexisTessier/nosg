// Generator: A function which create/remove files/directory
// Component: A part of a project, which share the same root directory. Can be made of one or multiple files, nested or not.
// Layer: A group of components, which have the same type of responsabilities in the project
// Components set: A group of components, classified into Layers

// nosg run-generator --generator='' --options="{name: hello, outputDirectory: out/path}" --sourcesDirectory="" --watch
// run a generator

// nosg create-component --layer --name --outputDirectory --sourcesDirectory=""

// nosg create-components-set
// nosg use-components-set
// nosg update-components-set
// nosg remove-components-set

// nosg init --sourceDirectory --path --name
// create a nosg project with 2 default components sets: nosg and main

// nosg alias => should be the reponsability of cleanquirer

// nosg lint

const layer = {
	name: 'view',
	createComponentGenerator:viewGenerator,
	lint: lintFunction
}

// "generators" and "layers" are nosg reserved layers names
// "components-set", "generator" and "layer" are nosg reserved generators names

//component path
set/layer/component // full path
layer/component // works only if one component match
set:component // works only if one component match
component // works only if one component match

//deep nesting requires to be accurate (more than 3 url fragments)
// set:component/deeply-nested-component doesn't work
// set:component/deeply/nested/component doesn't work
set/layer/component/deeply-nested-component
set/layer/component/deeply/nested/component

sources://source directory
	nosg://components set
		generators://layer
			components-set
			generator
			layer
		layers://layer
			generators
			layers
	lib:
		generators://layer
			dist // nosg run lib:dist
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
	main://components set
		generic://layer
		view://layer