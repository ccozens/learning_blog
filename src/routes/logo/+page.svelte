<!-- script -->
<script lang="ts">
</script>

<!-- html -->
<div class="logo">
	<div class="logo__container">
		<div class="logo__container__circle">
			<div class="logo__container__circle__inner" />
		</div>
	</div>
</div>
<p>drop</p>
<div class="drop" />
circles
<p />
<div class="circles" />
<p>svgdrop</p>
<svg class="drop" viewBox="0 0 100 100">
	<path
		d="M 50 0 C 22.385 0 0 22.385 0 50 C 0 77.615 22.385 100 50 100 C 77.615 100 100 77.615 100 50 C 100 22.385 77.615 0 50 0 Z"
	/>
</svg>

<p>svgcircles</p>
<svg class="svgcircles" viewBox="0 0 100 30">
	<circle cx="59" cy="15" r="8.5" fill="darkorange" />
	<circle cx="56" cy="15" r="9" fill="gold" />
	<circle cx="53" cy="15" r="9.5" fill="tomato" />
	<circle cx="50" cy="15" r="10" fill="teal" />
</svg>

<p>svgcircles2</p>
<ul>
	Circle attributes
	<li>cx = x-axis of the centre of the circle</li>
	<li>cy = y-axis of the centre of the circle</li>
	<li>r = radius of the circle</li>
	<li>pathLength = circumference length</li>
</ul>
<ul>
	Global svg attributes
	<li>fill = fill colour</li>
	<li>fill-opacity = opacity</li>
	<li>
		viewBox = attribute defines the position and dimension, in user space, of an SVG viewport.
	</li>
</ul>

<ul>
	Special attributes (as only certain elements can have them)
	<li>
		transform attribute defines a list of transform definitions that are applied to an element
		and the element's children.
	</li>
	transform inlcudes:
	<ul>
		<li>translate(x,y) = moves the element by x and y</li>
		<li>rotate(angle) = rotates the element by angle</li>
		<li>scale(x,y) = scales the element by x and y</li>
		<li>skewX(angle) = skew the element along the x-axis by angle</li>
		<li>skewY(angle) = skew the element along the y-axis by angle</li>
		<li>matrix(a,b,c,d,e,f) = applies a transformation matrix</li>
	</ul>
</ul>

<ul>
	text
	<li>x: x coordinate of the starting point of the text baseline</li>
	<li>y: y coordinate of the starting point of the text baseline</li>
	<li>dx: shift along the x-axis</li>
	<li>dy: shift along the y-axis</li>
	<li>rotate: rotation angle</li>
	<li>
		lengthAdjust: How the text is stretched or compressed to fit the width defined by the
		textLength attribute.
	</li>
	<li>textLength: A width that the text should be scaled to fit.</li>
	<li>
		text-anchor: defines which part of the text is aligned to the given x,y coordinates - start,
		middle, or end. [from the MDN
		docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor#example)
	</li>
</ul>

<svg class="svgcircles2" viewBox="0 0 100 30">
	<circle cx="50" cy="15" r="12" fill="teal" />
	<circle cx="50" cy="15" r="11" fill="tomato" />
	<circle cx="50" cy="15" r="10" fill="gold" />
	<circle cx="50" cy="15" r="9" fill="darkorange" />
	<text text-anchor="middle" x="50" y="21" font-size="12" fill="white">CC</text>
</svg>

<p>radialCircles</p>
<div class="radialCircles" />

<style>
	.drop {
		display: inline-block;
		background: #0ff;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		position: relative;
	}

	.drop::before {
		content: '';
		position: absolute;
		top: -81%;
		left: 50%;
		transform: translateX(-50%);
		border: 42px solid transparent;
		border-bottom: 62px solid #0ff;
	}

	.circles {
		background-color: red;
		width: 10vw;
		height: 10vw;
		border-radius: 50%;
		box-shadow: 1vw 0 0 -0.2vw green, 2vw 0 0 -0.2vw blue, 3vw 0 0 -0.2vw yellow;
	}

	.radialCircles {
		width: 115px;
		height: 100px;
		background-image: radial-gradient(circle at 50px 50px, #f00 0, #f00 50px, transparent 50px),
			radial-gradient(circle at 55px 50px, #ff0 0, #ff0 50px, transparent 50px),
			radial-gradient(circle at 60px 50px, #080 0, #080 50px, transparent 50px),
			radial-gradient(circle at 65px 50px, #00f 0, #00f 50px, transparent 50px);
	}
</style>
