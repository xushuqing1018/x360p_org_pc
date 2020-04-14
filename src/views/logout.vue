<template>
    <p>正在注销...</p>
</template>
<script>
	import api from '../api/common'
    export default {
        mounted() {
        	api.Logout().then(response=>{
        		this.$store.commit('clearLoginInfo')
//         		this.$router.replace({path:'/login'})
           		window.location.href = '/'
        	},response=>{
        		this.$store.commit('clearLoginInfo')
//         		this.$router.replace({path:'/login'})
				window.location.href = '/'
        	})
           
        }
    }
</script>

