<template>
	<div :style="{width: size+'px',height: size+'px',margin:'auto'}">
		<img :style="svgStyle" :src="src" v-if="src" style="cursor: pointer;" :title="title" onerror="this.src='http://s1.xiao360.com/common_img/avatar.jpg'">
		<svg :style='svgStyle' v-if="!src && name">
		  <text x='50%' y='50%' text-anchor='middle' dominant-baseline='central' :style='textStyle'>
		    {{ avatarLetter }}
		  </text>
		</svg>
	</div>
</template>

<script>
	export default {
	  props: {
	    size: {
	      type: String,
	      default: '50'
	    },
	    rounded: {
	      type: Boolean,
	      default: false
	    },
	    name: {
	      type: String
	    },
	    src: {
	    	type: String
	    },
	    title: {
	    	type: String,
	    	default: '点击预览'
	    }
	  },
	  data() {
	    // use hsl to define the background color.
	    return {
	      textStyle: {
	        fill: 'rgba(255, 255, 255, .6)',
	        fontSize: `${this.size * 0.65}px`
	      },
	    }
	  },
	  computed: {
	  	avatarLetter () {
	  		let name = this.name.trim()
	  		return name[0].toUpperCase()
	  	},
	  	svgStyle () {
		    let letterIndex = this.avatarLetter.charCodeAt() - 64,
		    hue = (360 / 26) * letterIndex,
		    backgroundColor = `hsl(${hue}, 68%, 48%)`,
	  		svgStyle = {
		        width: `${this.size}px`,
		        height: `${this.size}px`,
		        borderRadius: this.rounded ? '100%' : '0',
		        background: backgroundColor
		      }
	  		return svgStyle
	  	},
	  }
	}
</script>