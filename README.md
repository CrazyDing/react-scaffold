# **react-scaffold**

## **前端脚手架**

### 项目启动方式

> 环境安装

通过NVM安装Node.js V10.16.0 稳定版本  

[NVM下载链接](http://168.63.17.115:8888/node/nvm-setup.zip "NVM下载链接")  

[NVM安装Node.js方法](http://wiki.htzq.****.com.cn/pages/viewpage.action?pageId=41255071 "NVM安装Node.js方法")

> 切换NPM源

`npm config set registry https://registry.npm.taobao.org`

~~> 安装全局依赖~~

~~`npm install -g supervisor`~~

> 安装项目依赖

`cd react`  

`npm install`  

`npm start`  

> Mock服务(YAPI://<http://168.61.70.118:3000)>  

`cd react`  

`编辑 src/setupProxy.js`  

*启动项目...*  
*代码开发...*

### 代码提交

***提交代码，自动构建发布测试环境***  

1. ```Bash
     git pull(获取远程库代码并尝试合并冲突)
   ```

2. ```Bash
     手动解决冲突(如果上一步没有自动合并成功)
   ```

3. ```Bash
     git add file or directory(将改动的文件添加到暂存库)
   ```

4. ```Bash
     git commit -m "your message"(将暂存库的内容提交到本地工作区)
   ```

5. ```Bash
     git push -u origin branchName(将本地工作区的内容推送到远程服务器)
   ```
