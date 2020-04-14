<template>
	<div class="hide" v-if="show"></div>
</template>
<script>
var KEYUP_BINDED = false,
  keys=[],
  interval = 40,
  number_len = [6,20],
  last_ms=0,
  now_ms =0,
  noop = function(cn){console.log(cn);},
  cb = noop,
  has_instance = false

function clearKeyCache(){
  keys = [];
}

function keyupHandler(e){
  var keycode,dms,key,cn;
  now_ms = (new Date()).getTime();
  dms = now_ms - last_ms;
  if(dms > interval){
    clearKeyCache();
  }
  keycode = e.keyCode || e.which || e.charCode;
  if(keycode == 13){
      key = 'enter';
  }else{
    if(!e.key){
        key = String.fromCharCode(keycode);
    }else{
      key = e.key
    }
  }
  if(!/^[a-zA-Z\/\d]$/.test(key) && key != 'enter'){
    return;
  }
  
  if(key == 'enter'){
    if(keys.length > number_len[0] && keys.length < number_len[1]){
      cn = keys.join('');
      cb(cn,e.target,e);
      last_ms = 0;
    }
  }else{
    keys.push(key);
  }

  last_ms = now_ms;
}

function isNumber(ch) {
  return ('0' <= ch && ch <= '9');
}

function cardReader(fn,ms){
  if(has_instance){
    return noop;
  }
  cb = fn;
  if(typeof cb != 'function'){
    return noop;
  }
  if(isNumber(ms)){
    interval = ms;
  }
  has_instance = true;
  return keyupHandler;
}

export default {
	name:'cardReader',
	data(){
		return {
			show:false,
			action:'attendance'
		}
	},
	created(){
		let vm = this
		if(!KEYUP_BINDED){
			document.addEventListener('keyup',
			cardReader(
				function(cardNo,elem){
	                if(elem.tagName.toLowerCase() == 'input'){
	                    return;
	                }
                  if(/^1[0-5]\d{16}$/.test(cardNo)){
                    vm.$store.commit('updateScanReader',cardNo)
                  }
                  else if(/99\d{9}/.test(cardNo)) {
                    vm.$emit('barcode',cardNo)
                  }
                  else{
                    vm.$emit('reader',{cardNo:cardNo,action:vm.action})
                  }
	                
            	}
            )
            )
			KEYUP_BINDED = true
		}
	},
	methods:{
		setAction(action){
			this.action = action
		}
	}
}
</script>