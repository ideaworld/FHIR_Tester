
var app = app || {};


(function(){
    var SideMenuButton = app.SideMenuButton = React.createClass({displayName: "SideMenuButton",
        getInitialState(){
            return {resources:[]};
        },
        componentDidMount:function(){
            $.get(app.host+ '/home/resources', function (result) {
                if( result.isSuccessful ){
                    this.setState({resources:result.names});
                }
            }.bind(this));
        },
        onResourceChange:function(){
            var resource_state = []; 
            for ( var i = 0; i < this.state.resources.length; i++ ){
                var resource_name = this.state.resources[i].name
                resource_state.push({
                    name:resource_name,
                    checked:this.refs[resource_name].checked
                });
            }
            this.setState({resources:resource_state});
            // this.props.updateResource(resource_state);
        },
        handleClick:function(){
            this.props.submitTestTask(app.FHIR_TEST,this.state.resources);
        },
        render:function(){
            return (
                React.createElement("div", {className: "btn-group"}, 
                    React.createElement("button", {type: "button", onClick: this.handleClick, className: "btn btn-primary"}, "FHIR Test"), 
                    React.createElement("button", {type: "button", className: "btn btn-primary dropdown-toggle", "data-toggle": "dropdown"}, 
                        "Options ", React.createElement("span", {className: "caret"}), 
                        React.createElement("span", {className: "sr-only"}, "Toggle Dropdown")
                    ), 
                    React.createElement("ul", {className: "dropdown-menu customed-menu", role: "menu"}, 
                    this.state.resources.map(function(resource){
                        return (
                        React.createElement("li", null, 
                            React.createElement("label", null, 
                                React.createElement("input", {ref: resource.name, onChange: this.onResourceChange, type: "checkbox", checked: resource.checked}), " ", resource.name
                            )
                        )
                        );
                    },this)
                    )
                )
            );
        }
    });
    var TestButton = app.TestButton = React.createClass({displayName: "TestButton",
        handleClick: function() {
            this.props.submitTestTask(this.props.btnType);
        },
        render: function() {
            return ( React.createElement("button", {onClick:  this.handleClick, 
                className: "btn btn-test"}, " ", React.createElement("span", {className: "btn-test-text"}, " ",  this.props.btn_name, " ")) );
        }
    });
    app.CodeEditor = React.createClass({displayName: "CodeEditor",
        getInitialState:function(){
            return {isDragging:true}
        },
        handleType:function(){
            this.props.updateCode(this.editor.session.getValue());
        },
        stopFrameListeners: function(frame) {
            frame = frame || this.props.frame;
            frame.removeEventListener("dragenter", this._handleFrameDrag);
            frame.removeEventListener("dragleave", this._handleFrameDrag);
            frame.removeEventListener("drop", this._handleFrameDrop);
        },
        startFrameListeners: function(frame) {
            frame = frame || this.props.frame;
            frame.addEventListener("dragenter", this._handleFrameDrag);
            frame.addEventListener("dragleave", this._handleFrameDrag);
            frame.addEventListener("drop", this._handleFrameDrop);
        },
        _handleWindowDragOverOrDrop: function(event) {
            event.preventDefault();
        },
        _handleFrameDrag: function (event) {
            // We are listening for events on the 'frame', so every time the user drags over any element in the frame's tree,
            // the event bubbles up to the frame. By keeping count of how many "dragenters" we get, we can tell if they are still
            // "draggingOverFrame" (b/c you get one "dragenter" initially, and one "dragenter"/one "dragleave" for every bubble)
            
        },

        _handleFrameDrop: function(event) {
           
        },
        componentWillMount: function() {
            this.startFrameListeners();
            window.addEventListener("dragover", this._handleWindowDragOverOrDrop);
            window.addEventListener("drop", this._handleWindowDragOverOrDrop);
        },
        componentDidMount:function(){
            this.editor = ace.edit("codeeditor");
            this.editor.setTheme("ace/theme/clouds");
            this.editor.setOptions({
                fontSize: "1.2em"
            });
            this.editor.session.setMode("ace/mode/"+this.props.language);
        },
        componentWillUnmount: function() {
            this.stopFrameListeners();
            window.removeEventListener("dragover", this._handleWindowDragOverOrDrop);
            window.removeEventListener("drop", this._handleWindowDragOverOrDrop);
        },
        handleDrop:function(event){
            event.preventDefault();
            var files = (event.dataTransfer) ? event.dataTransfer.files : (event.frame) ? event.frame.files : undefined;
            console.log(files);
        },
        render:function(){
            return (
                React.createElement("div", {id: "codeeditor", onDrop: this.handleDrop, onKeyUp: this.handleType}
                )
            );
        }
    });
    app.TokenEditor = React.createClass({displayName: "TokenEditor",
        handleChange:function(){
            var new_token = this.refs.tokenInput.value;
            this.props.updateToken(new_token);
        },
        render: function(){
            return (
                React.createElement("input", {className: "input-url", onChange: this.handleChange, ref: "tokenInput", placeholder: "Input Server Access Token"})
            );
        }
    });
    app.UrlEditor = React.createClass({displayName: "UrlEditor",
        getInitialState: function(){
            return {
                url_vaild:true
            }
        },
        handleChange:function(){
            //if url valid, update state, if not, warn
            var url_str = this.refs.urlInput.value;
            if (app.isUrl(url_str)){
                this.setState({url_vaild:true});
                //this.probs.updateUrl(url_str)
            }else{
                this.setState({url_vaild:false});
            }
            this.props.updateUrl(url_str);
        },
        classNames:function(){
            return 'input-url ' + ((this.state.url_vaild) ? 'input-right':'input-error');
        },
        render: function(){
            return (
                React.createElement("input", {className: this.classNames(), onChange: this.handleChange, ref: "urlInput", placeholder: "Type Server or App URL"})
            );
        }
    });
    var ServerList = app.ServerList = React.createClass({displayName: "ServerList",
        getInitialState:function(){
            return {chosedServer:-1, currentDisplay:"Servers",servers:[]};
        },
        componentDidMount:function(){
            //get server list
            this.serverRequest = $.get(app.host+ '/home/servers', function (result) {
                if( result.isSuccessful ){
                    this.setState({servers:result.servers});
                }
            }.bind(this));
        },
         componentWillUnmount: function() {
            this.serverRequest.abort();
        },
        onServerClick:function(event){
            this.props.updateServer(event.currentTarget.dataset.serverid);
            this.setState({currentDisplay:event.currentTarget.dataset.servername});
        },
        render:function(){
            return (
                    React.createElement("div", {className: "dropdown server-list"}, 
                        React.createElement("button", {ref: "menu_display", className: "btn btn-default dropdown-toggle", type: "button", id: "dropdownMenu1", "data-toggle": "dropdown"}, 
                            this.state.currentDisplay, 
                            React.createElement("span", {className: "caret"})
                        ), 
                        React.createElement("ul", {className: "dropdown-menu", role: "menu", "aria-labelledby": "dropdownMenu1"}, 
                            this.state.servers.map(function(server){
                                return React.createElement("li", {role: "presentation"}, React.createElement("a", {"data-serverName": server.name, "data-serverid": server.id, onClick: this.onServerClick, role: "menuitem", tabindex: "-1", href: "#"}, server.name))
                            }.bind(this))
                        )
                    )
            );
        }
    })
    var ResultDisplay = app.ResultDisplay = React.createClass({displayName: "ResultDisplay",
        getInitialState:function(){
            return {'level':-1,test_type:null,  test_type_str:'', 'steps':[]}
        },
        emptyCurrentDisplay:function(){
            this.setState({steps:[]});
        },
        displayResult:function(res_dict){
            console.log(res_dict);
            var test_type = res_dict.test_type
            this.setState({test_type:test_type});
            var test_type_str = ''
            if( test_type == 0 ){
                test_type_str = 'Genomics Standard Test'
            }else if( test_type == 1 ){
                test_type_str = 'Application Test'
            }else{
                test_type_str = 'Custom Server Test'
            }
            this.setState({'test_type_str':test_type_str})
            if (test_type == 0){
                this.setState({'level':res_dict.level});
            }
            this.setState({'steps':res_dict['steps']});
        },
        render: function(){
            return (
                React.createElement("div", {className: "result-container"}, 
                    React.createElement("div", {className: "result-head"}, React.createElement("span", {className: "area-title area-title-black"}, "Test Type: ", this.state.test_type_str), " ", React.createElement("span", null)), 
                    React.createElement("div", {className: "detail-result"}, 
                        React.createElement("div", {className: "result-sum"}, 
                            this.state.test_type == 0 ? React.createElement("h3", null, "Level: ", this.state.level) : null
                        ), 
                        this.state.steps.map(function(step){
                            return React.createElement(StepDisplay, {showFullyDetail: this.props.showFullyDetail, stepInfo: step})
                        },this)
                    )
                )
            )
        }
    });

    var HTTPDetail = app.HTTPDetail = React.createClass({displayName: "HTTPDetail",
        render:function(){
            return(
                React.createElement("div", {className: "http-area detail-result"}, 
                    
                    this.props.detail.req_header != null ? 
                        React.createElement("div", {className: "http-content"}, 
                        React.createElement("h4", null, "HTTP Request Header"), 
                        React.createElement("pre", null, JSON.stringify(JSON.parse(this.props.detail.req_header), null, 2) ), " "):
                        null, 
                    
                    
                    
                    this.props.detail.res_header != null ? 
                        React.createElement("div", {className: "http-content"}, 
                        React.createElement("h4", null, "HTTP Response Header"), 
                        React.createElement("pre", null, JSON.stringify(JSON.parse(this.props.detail.res_header), null, 2) )) :
                        null, 
                    
                    this.props.detail.response_message != null ?
                        React.createElement("div", {className: "http-content"}, 
                        React.createElement("h4", null, "Response Message"), 
                        React.createElement("pre", null, JSON.stringify(JSON.parse(this.props.detail.response_message), null, 2) ), " "): 
                        null, 
                    

                    this.props.detail.req_resource != null ?
                        React.createElement("div", {className: "http-content"}, 
                        React.createElement("h4", null, "Test Resource"), 
                        React.createElement("pre", null, JSON.stringify(JSON.parse(this.props.detail.req_resource), null, 2) )) :
                        null
                    

                )
            );
        }
    });

    var FullyDetail = app.FullyDetail = React.createClass({displayName: "FullyDetail",
        render:function(){
            return (
                React.createElement("div", {className: "result-container"}, 
                    React.createElement("div", {className: "result-head"}, React.createElement("span", {className: "area-title area-title-black"}, "Test case detail "), 
                    this.props.detail.status ? React.createElement("span", {className: "success-bar"}, "Success") : React.createElement("span", {className: "fail-bar"}, "Fail")
                    ), 
                    React.createElement("div", {className: "detail-desc-block"}, 
                            this.props.detail.desc
                    ), 
                    React.createElement(HTTPDetail, {detail: this.props.detail})
                )
            );
        }
    });

    var StepDisplay = app.StepDisplay = React.createClass({displayName: "StepDisplay",
        getInitialState: function(){
            return {
                is_img_hide:true,
                is_modal_show:false,
                is_has_image:false,
                is_detail_showing:false,
                detail_desc:''
            }
        },
        showDetail:function(detail){
            if(this.state.detail_desc === detail.desc){
                this.setState({is_detail_showing:!this.state.is_detail_showing});
            }else{
                this.setState({detail_desc:detail.desc, is_detail_showing:true});
            }
            this.props.showFullyDetail(detail) 
        },
        componentDidMount:function(){
            if(this.props.stepInfo.addi){
                this.setState({is_has_image:true});
            }
        },
        handleTextClick:function(){
            if (this.state.is_has_image){
                this.setState({is_img_hide:!this.state.is_img_hide});
            }
        },
        componentWillReceiveProps:function(nextProps){
            if (nextProps.stepInfo.addi.length != 0){
                this.setState({is_has_image:true})
            }
        },
        handleShowFullImage:function(event){
            event.stopPropagation();
            this.setState({is_modal_show:true});
        },
        handleHideModal(){
            this.setState({is_modal_show:false});
        },
        handleShowModal(){
            this.setState({is_modal_show: true});
        },
        render:function(){
            return (
                React.createElement("div", {className: "step-brief step-brief-success", onClick: this.handleTextClick}, 
                    React.createElement("div", null, React.createElement("span", {className: "step-brief-text"}, this.props.stepInfo.desc)), 
                    React.createElement("div", {className: "step-detail-area"}, 
                        React.createElement("div", {className: "detail-hint-block"}, 
                            this.props.stepInfo.details.map(function(detail){
                                return React.createElement(StepDetail, {fully_detail: detail, status: detail.status, desc: detail.desc, showDetail: this.showDetail})
                            }, this)
                        ), 
                        this.state.is_detail_showing ? React.createElement("div", {className: "detail-desc-block"}, 
                            this.state.detail_desc
                        ) : null
                        
                    ), 
                    React.createElement("div", {hidden: this.state.is_img_hide && !this.state.is_has_image, className: "step-img-block"}, 
                        React.createElement("button", {onClick: this.handleShowFullImage, className: "btn btn-primary"}, "Full Image"), 
                        React.createElement("img", {className: "img-responsive img-rounded step-img", src: app.host + this.props.stepInfo.addi})
                    ), 
                    this.state.is_modal_show && this.state.is_has_image ? React.createElement(Modal, {handleHideModal: this.handleHideModal, title: "Step Image", content: React.createElement(FullImageArea, {img_src: app.host + this.props.stepInfo.addi})}) : null
                )
            );
        }
    });
    var StepDetail = app.StepDetail = React.createClass({displayName: "StepDetail",
        classes:function(){
            return 'btn' + this.props.status ? ' btn-success': ' btn-danger' + ' btn-circle';
        },
        onBtnClick:function(){
            this.props.showDetail(this.props.fully_detail);
        },
        render:function(){
            return (
                React.createElement("button", {onClick: this.onBtnClick, className: this.props.status ? 'btn btn-circle btn-success': 'btn btn-circle btn-danger'},  this.props.status ? 'P' : 'F')
            )
        }
    })
    app.UserBtnArea = React.createClass({displayName: "UserBtnArea",
        handleLogout:function(){
            $.removeCookie('fhir_token', { path: '/' });
            window.location.href = '/'
        },
        render:function(){
            return (
                React.createElement("div", {className: "user-op"}, 
                    React.createElement("button", {className: "btn btn-user", onClick: this.props.history_action}, "History"), 
                    React.createElement("button", {className: "btn btn-user", onClick: this.props.search_action}, "Search Task"), 
                    React.createElement("button", {className: "btn btn-user", onClick: this.handleLogout}, React.createElement("span", {className: "glyphicon glyphicon-off"}))
                )
            );
        }
    });
    var FullImageArea = app.FullImageArea = React.createClass({displayName: "FullImageArea",
        render:function(){
            return(
                React.createElement("img", {src: this.props.img_src, className: "img-responsive"})
            );
        }
    });
    var TaskItem = app.TaskItem = React.createClass({displayName: "TaskItem",
        handleClick:function(){
            this.props.itemClicked(this.props.task_id);
        },
        render:function(){
            return (
                React.createElement("div", {className: "list-item", onClick: this.handleClick}, 
                    React.createElement("span", null, "Task ID: "), this.props.task_id, 
                    React.createElement("span", {className: "pull-right"}, " Time: ", this.props.task_time)
                )
            );
        }
    });
    var TaskList = app.TaskList = React.createClass({displayName: "TaskList",
        render:function(){
            return (
                React.createElement("div", {className: "task-list"}, 
                    
                    React.createElement("div", {className: "list-content"}, 
                        this.props.tasks.map(function(task_info){
                            return React.createElement(TaskItem, {itemClicked: this.props.fetchTaskDetail, task_id: task_info.task_id, task_time: task_info.time})
                        },this)
                    )
                )
                );
        }
    });
    var TaskSearchView = app.TaskSearchView = React.createClass({displayName: "TaskSearchView",
        getInitialState:function(){
            return {keywords:'', tasks:[]}
        },
        updateTestResult:function(res){
            this.refs.res_area.displayResult(res);
        },
        componentDidMount:function(){
            window.searchView = this;
        },
        onUserInput:function(){
            var self = this;
            var postData = {
                'keyword':this.refs.keywordField.value
            }
            $.ajax({
                url:app.host+ '/home/search',
                type:'POST',
                data:JSON.stringify(postData),
                dataType:'json',
                cache:false,
                success:function(data){
                    if( data.isSuccessful ){
                        self.setState({tasks:data.tasks});
                    }
                }
            });
        },
        getTaskDetail:function(task_id){
            this.refs.res_area.emptyCurrentDisplay();
            console.log(task_id);
            app.setup_websocket(task_id,3)
        },
        render:function(){
            return (
                React.createElement("div", {className: "task-search-area"}, 
                    React.createElement("input", {className: "input-url", placeholder: "Search Tasks...", ref: "keywordField", onChange: this.onUserInput}), 
                    React.createElement("div", {className: "history-area"}, 
                    React.createElement(TaskList, {fetchTaskDetail: this.getTaskDetail, tasks: this.state.tasks}), 
                    React.createElement(ResultDisplay, {ref: "res_area"})
                    )
                )
            )
        }
    });
    var HistoryViewer = app.HistoryViewer = React.createClass({displayName: "HistoryViewer",
        getInitialState:function(){
            return {tasks:[]};
        },
        updateTestResult:function(res){
            this.refs.res_area.displayResult(res);
        },
        componentDidMount:function(){
            window.hist = this;
            var postData = {
                token:$.cookie('fhir_token')
            };
            var self = this;
            console.log(postData);
            $.ajax({
                url:app.host+ '/home/history',
                type:'POST',
                data:JSON.stringify(postData),
                dataType:'json',
                cache:false,
                success:function(data){
                    if( data.isSuccessful ){
                        self.setState({tasks:data.tasks});
                    }
                }
            });
        },
        getTaskDetail:function(task_id){
            this.refs.res_area.emptyCurrentDisplay();
            console.log(task_id);
            app.setup_websocket(task_id,2)
        },
        render:function(){
            return (
                React.createElement("div", {className: "history-area"}, 
                    React.createElement(TaskList, {fetchTaskDetail: this.getTaskDetail, tasks: this.state.tasks}), 
                    React.createElement(ResultDisplay, {ref: "res_area"})
                )
            );
        }
    });
    var ReportView = app.ReportView = React.createClass({displayName: "ReportView",
        getCellStatus:function(status){
                if( status ){
                    return 'success'
                }else{
                    return 'danger'
                }
        },
        render:function(){
            return(
                React.createElement("div", {className: "report-area"}, 
                    React.createElement("div", {className: "brief-info"}, 
                        React.createElement("h4", null, "Test Type: ", this.props.report.test_type), 
                        React.createElement("h4", null, "Target Server: ", this.props.report.server), 
                        React.createElement("h4", null, "Level: ", this.props.report.level)
                    ), 
                    React.createElement("div", {className: "table-info"}, 
                    React.createElement("h3", null, "Details"), 
                        React.createElement("table", {className: "table table-bordered"}, 
                        React.createElement("tbody", null, 
                        this.props.report.infos.map(function(info){
                            return (
                                React.createElement("tr", null, 
                                    React.createElement("td", null, info.name), 
                                    info.detail_infos.map(function(detail){
                                        return React.createElement("td", {className: this.getCellStatus(detail.status)}, detail.resource)
                                    },this), 
                                    React.createElement("td", {className: this.getCellStatus(info.status)}, " ", info.name, " ", info.status ? 'Passed' : 'Failed')
                                )
                            );
                        },this)
                        )
                        )
                    )
                )
            )
        }
    });
    var Modal = app.Modal = React.createClass({displayName: "Modal",
        componentDidMount(){
            $(ReactDOM.findDOMNode(this)).modal('show');
            $(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal);
        },
        render:function(){
            return (
                React.createElement("div", {className: "modal modal-wide fade"}, 
                    React.createElement("div", {className: "modal-dialog"}, 
                        React.createElement("div", {className: "modal-content"}, 
                            React.createElement("div", {className: "modal-header"}, 
                                React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close"}, React.createElement("span", {"aria-hidden": "true"}, "×")), 
                                React.createElement("h4", {className: "modal-title"}, this.props.title)
                            ), 
                            React.createElement("div", {className: "modal-body"}, 
                                this.props.content
                            ), 
                            React.createElement("div", {className: "modal-footer text-center"}, 
                                React.createElement("button", {className: "btn btn-primary center-block", "data-dismiss": "modal"}, "Close")
                            )
                        )
                    )
                )
            );
        }
    });
})();

