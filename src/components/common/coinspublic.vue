<template>
  <div class="coin-public">
    <div class="control-wrapper">
    </div>

    <div class="list-wrapper">
      <el-table
        :stripe="true"
        :data="listData"
      >
        <el-table-column
          prop="name"
          label="币名"
          width="210"
        >
        </el-table-column>
        <el-table-column
          label="维护状态"
          min-width="210">
          <template slot-scope="scope">
            {{Number(scope.row.maintainStatus)?'on':'off'}}
          </template>
        </el-table-column>
        <el-table-column
          width="120"
          label="维护"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.maintainStatus"
              active-color="#49a7f3"
              active-value="1"
              inactive-value="0"
              @change="changeMaintain($event,scope.row)"
            >

            </el-switch>
          </template>
        </el-table-column>
      </el-table>
      <!--列表loading-->
      <div v-show="loading" class="loading-wrap">
        <img src="@img/loading.gif" alt="">
      </div>
    </div>
  </div>
</template>

<script>
  import api from '@/axios/api'
  import {post,get,put} from '@/axios'
  import {cookies} from '@/assets/js/tools'

  export default {
    name: "coinspublic",
    data(){
      return{
        loading:false,
        listData:[],
        aaa:false
      }
    },
    computed:{

    },
    methods:{
      getList(){
        this.loading = true;
        get(api.PUBLIC_CHAIN)
          .then(({data})=>{
            this.loading = false;
            if(data.code){
              //请求失败
              switch (data.code) {
                case 7001 || 7002://token失效，清除token和保存的用户名，重定向至登陆页
                  cookies('token','');
                  cookies('username','');
                  this.$router.replace({name:'home'});
                  break;
                default://弹出未知错误对话框
                  // this.totalItems = 0;
                  // this.createDialog({message:data.message || '未知错误',err:true});
                  break;
              }
            }else {
              this.listData = data
            }
          })
      },
      changeMaintain(ev,item){
        //阻止立即切换状态
        if(ev === '0'){
          item.maintainStatus = '1'
        }else {
          item.maintainStatus = '0'
        }
        //弹出弹窗询问是否要进行维护切换，返回promise
        let title;
        ev === '1' ? title='开启维护':title='关闭维护';
        this.$msgbox({
          title:`请确认是否${title}！`,
          message:`<div class="t-c">币名：${item.name}</div>`,
          dangerouslyUseHTMLString:true,
          lockScroll:false,
          showCancelButton:true,
          confirmButtonText:title,
          cancelButtonText:'取消',
          beforeClose:(action,instance,done)=>{
            //提交认证
            if(action === 'confirm'){
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = '正在提交...';
              put(api.PUBLIC_CHAIN_UPDATE+item.name,Object.assign(item,{maintainStatus:ev}))
                .then(({data})=>{
                  instance.confirmButtonLoading = false;
                  instance.confirmButtonText = title;
                  //认证成功,重新请求数据
                  if(data.code === 0){
                    this.getList();
                    item.maintainStatus = ev;
                    done();
                    this.$message({
                      type: 'success',
                      message: '操作成功！'
                    });
                  }else {
                    this.$message({
                      type: 'warning',
                      message: data.message || '操作失败'
                    });
                  }
                })
                //认证失败
                .catch(err=>{
                  instance.confirmButtonLoading = false;
                  instance.confirmButtonText = title;
                  this.$message({
                    type: 'error',
                    message: err.message || '未知错误'
                  });
                });
            }else {
              //取消认证
              done();
              this.$message({
                type: 'info',
                message: '您已取消操作'
              });
            }
          }
        }).then(()=>{
        }).catch(()=>{})
      }
    },
    created(){
      this.getList()
    },
  }
</script>

<style lang="stylus">



</style>
