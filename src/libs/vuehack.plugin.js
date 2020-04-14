import $rest from './rest'
function install(Vue,options){
  Vue.prototype.$filter = function(id){
    return this._f(id)
  }
  Vue.prototype.$rest   = $rest
}

export default {
  install
}