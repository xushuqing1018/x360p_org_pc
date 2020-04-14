<template>
	<div class="model-over bg-back">
		<div class="model-center">
			<div>
				<img class="img-circle thumb-lg" :src="user.avatar" v-if="user.avatar">
				<img class="img-circle thumb-lg" src="/static/img/avatars/6.jpg" v-else>
			</div>
			<p class="m-b m-t h5"><span>{{user.name}}</span></p>
			<div class="input-group">
				<input type="password" @keyup.enter="unlock" class="lock form-control btn-rounded" v-model="user.password"/>
				<span class="input-group-btn">
					<a @click="unlock" class="btn btn-success btn-rounded no-border">						
						<Icon type="arrow-right-c"></Icon>
					</a>
				</span>
			</div>
		</div>
	</div>
</template>

<script>
	import Auth from '../libs/auth'
	export default{
		data () {
			return {
				user: {
					name: '',
					password: '',
					avatar: '',
				},
				backurl:'',
			}
		},
		mounted () {
			if(!Auth.isLock()){
				Auth.setLock(true)			
			}
			this.initData()
			this.backurl = (this.$route.query.backurl === undefined) ? '/home' : this.$route.query.backurl
		},
		methods: {
			unlock () {							
				this.$http.post('unlock',{password:this.user.password})
				.then(response=>{
					Auth.setLock(false)
					this.$router.push({path:this.backurl})
				},response=>{
					this.$Message.error(response.body.message)
				}).catch(error=>{
					this.$Message.error(error)
				})
			},
			initData () {
				if(Auth.getLocalLogin().info){
					this.user.name = Auth.getLocalLogin().info.name
					this.user.avatar = Auth.getLocalLogin().info.avatar
				}
			}
		}
	}
</script>

<style type="sass">
.thumb-lg {
	display: inline-block;
	width: 96px;
}
.model-over{
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;	
	z-index: 1;
}	
.bg-back{
    color: #7793a7;
    background-color: #1c2b36;
}
.model-center{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    margin: -100px 0 0 -100px;
    text-align: center;
}
.m-b {
    margin-bottom: 15px !important;
}
.m-t {
    margin-top: 15px;
}
.input-group{
	height: 34px;	
}
input[type=password].lock{
    border-radius: 50px 0 0 50px !important;
}
.btn-rounded {
    padding-right: 15px;
    padding-left: 15px;
    border-radius: 50px;
}
a.btn-success.btn-rounded{
	border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    color: #fff !important;
    padding: 6px 12px;
}
</style>
