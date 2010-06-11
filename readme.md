h1. The Idea

Templates can be separated into static and functional parts.
* So why should we wait on the previous functional part to finish blocking to continue?
* Why are templates of html allowed to be based not on html elements, but rather raw strings?
* Why dont templates have the ability to diff() each other in order to make ajax primers easy?

h2. Templates

Templates are made up of Values and Blocks. You do not have to interweave these (leads to a).

h3. Values

* Strings that are not dynamic (non-functions will be converted to strings).
* Functions that return values.

h4. Blocking Values

* Value that return an Object with an addListener method are expected to be ReadableStreams.

Grain will queue up each of these Objects by adding an event listener for __'data'__ and __'end'__ and will not send out the template until all streams have ended.

h3. Blocks

A block is a distinct value that has significance in that its path is relatively absolute.

* An html based value that allows for extending other blocks and can be referenced by an XPath expression.

h1. The Plan

Client =Request=> Server

Server =Render=> Template

Template =Spin Up=> [
	"text1"
	, blocker1
	, "text2"
	, blocker2
	, blocker3
	, Date()//Transforms into a String saying when the Template was first initialized
]
Server =Respond[text1]=> Client//Its already ready, just send it

h2. Stream Reclamation

All the blockers are set off at the same time so if 1 is accessing a db via tcp it is not blocking a file system call for any of the others etc.

... Once blockers 1-3 complete

Server =Respond=> Client