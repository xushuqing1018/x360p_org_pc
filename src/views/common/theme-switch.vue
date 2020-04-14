<template>
    <div style="display:inline-block;padding:0 6px;">
        <Dropdown trigger="click" @on-click="setTheme">
            <span href="javascript:void(0)">
                <Icon :style="{marginTop: '-2px', verticalAlign: 'middle'}" :size="18" type="paintbucket"></Icon>
                <Icon type="arrow-down-b"></Icon>
            </span>
            <DropdownMenu slot="list">
                <DropdownItem v-for="(value,key) in themeList" :key="value" :name="key">
                    <span class="ml-3"><Icon :size="22" type="record" :color="value"/></span>
                    <span v-if="key==theme" class="ml-2"><Icon type="checkmark" :color="value" size="16"></Icon></span>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </div>
</template>

<script>
import Vue from 'vue'
import common from '@/libs/common.mixin'

const THEME = '__USER_THEME_LIST__'
export default {
    name: 'themeSwitch',
    mixins: [common],
    data () {
        return {
            themeList: {
            	'theme-default': '#1C2B36',
            	'theme-light'  : '#93c8f8',
            	'theme-ayan'   : '#01b1dc',
            	'theme-pink'   : '#ff7394',
            	'theme-green'  : '#00cc9e',
                'theme-yellow' : '#f6b618'
            }
        };
    },
    methods: {
        setTheme (theme) {
            this.$store.commit('setAppTheme',{
            	theme: theme,
            	color: this.themeList[theme]
            })
            let userName = this.user_name
            let localTheme = Vue.localStorage.get(THEME)
            if(localTheme) {
            	let themeList = JSON.parse(localTheme)
            	let index = 0
                let hasThisUser = themeList.some((item, i) => {
                    if (item.userName === userName) {
                        index = i
                        return true
                    } else {
                        return false
                    }
                })
                if (hasThisUser) {
                    themeList[index].theme = theme
                } else {
                    themeList.push({
                        userName: userName,
                        theme: theme,
                    })
                }
                Vue.localStorage.set(THEME,JSON.stringify(themeList))
            }else{
            	Vue.localStorage.set(THEME,JSON.stringify([{
            		userName: userName,
            		theme: theme
            	}]))
            }
        }
    },
    created () {
        let userName = this.user_name
        let localTheme = Vue.localStorage.get(THEME)
        if(localTheme) {
        	let hasThisUser = JSON.parse(localTheme).some(item => {
                if (item.userName === userName) {
                    this.$store.commit('setAppTheme', {
                    	theme: item.theme,
                    	color: this.themeList[item.theme]
                    });
                    return true
                } else {
                    return false
                }
            })
            if (!hasThisUser) {
            	let theme = 'theme-default'
                this.$store.commit('setAppTheme', {
                	theme: theme,
                	color: this.themeList[theme]
                })
            }
        }else{
            let org_theme = this.$store.state.client.params.pc.theme
            if(org_theme != 'default'){
            	let theme = 'theme-'+org_theme
                this.$store.commit('setAppTheme',{
                	theme: theme,
                	color: this.themeList[theme]
                })
            }
        }
    },
    computed: {
    	user() {
    		return this.$store.state.user
    	},
    	user_name() {
    		return this.user.info.name?this.user.info.name:this.user.info.account
    	}
    }
};
</script>
