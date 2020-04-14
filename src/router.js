import rc from './router.config'
import vf from './vuefiles'
//路由列表
let routers = [],map = {}
//路由节点key
const router_node_keys = ['redirect','file','path','children','sub','name','hidden']

let toString = Object.prototype.toString

const isString = function(obj){
    return toString.call(obj) === '[object String]'
}

const isUndefined = function(obj) {
    return obj === void 0
}
/**
 * 获得Vue Component
 * @param  {[type]} file [description]
 * @param  {[type]} sync [description]
 * @return {[type]}      [description]
 */
function vc(file,sync = false){
    let key = file.replace(/\//g,'_').replace(/\-/g,'$')
    if(sync){
        key = 'page'+file
        return vf[key]
    }
    return vf[key]
}

/**
 * 创作路由节点
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
function create_router_node(configs,parent = []){
    let routers = []
    
    function get_file(key,cfg){
        if(cfg.file){
            return cfg.file
        }
        let dirs = []
        if(parent.length > 1){
            let i = 0;
            parent.forEach(p=>{
                if(i > 0){
                    dirs.push(p.path)
                }
                i++
            })
        }
        dirs.push(key)
        let file = dirs.join('/')
        if(file.substr(0,1) == '/'){
            file = file.substr(1)
        }
        return file
    }

    function get_name(file){
        return file.replace(/\//g,'_').replace(/\-/g,'$')
    }

    /**
     * 获得面包屑
     * @param  {[type]} title [description]
     * @return {[type]}       [description]
     */
    function get_breadcrumbs(title){
        let cur_bc = {href:'',text:title}
        let bcs = []
        let paths = []
        if(parent.length > 0){
            parent.forEach(p=>{
                let href = p.path
                if(paths.length > 1){
                    let new_path = [].concat(paths)
                    new_path.splice(0,1)
                    new_path.push(p.path)
                    href = new_path.join('/')
                }
                bcs.push({
                    href:href,
                    text:p.meta.title
                })
                paths.push(p.path)
            })
        }
        bcs.push(cur_bc)
        return bcs
    }

    for(let key in configs){
        let local_parent = []
        if(parent.length > 0){
            parent.forEach(p=>{
                local_parent.push(p)
            })
        }
        let cfg = configs[key]
        if(isString(cfg)){
            cfg   = {
                title:cfg
            }
        }
        let node = {}
        let file = get_file(key,cfg)
        let sync = cfg.sync ? cfg.sync : false
        node.name = get_name(file)
        node.path = cfg.path ? cfg.path : parent.length == 0 ? '/' + key : key
        if(key != 'any'){
            node.component = vc(file,sync)
        }
        if(cfg['redirect']){
            node.redirect = cfg.redirect
        }
        node.meta = {}

        for(let k in cfg){
            let v = cfg[k]
            if(router_node_keys.indexOf(k) === -1){
                node.meta[k] = v
            }
        }

        let first_parent = local_parent.length > 0 ? local_parent[local_parent.length -1]:null

        if(isUndefined(node.meta.bid) && first_parent && !isUndefined(first_parent.meta.bid)){
            node.meta.bid = first_parent.meta.bid
        }

        if(isUndefined(node.meta.breadcrumbs)){
            node.meta.breadcrumbs = get_breadcrumbs(node.meta.title)
        }

        if(cfg.hidden){
            node.hidden = cfg.hidden
        }

        if(cfg.sub){
            local_parent.push(node)
            node.children = create_router_node(cfg.sub,local_parent)
        }
        map[node.name] = node
        routers.push(node)

    }
    return routers
}

routers = create_router_node(rc)

export {map}
export default routers;