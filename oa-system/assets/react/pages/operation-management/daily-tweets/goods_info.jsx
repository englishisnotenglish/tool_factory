import PageCtrlBar from '../../../../components/page/paging.js';

class GoodsInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],   //用户列表数据;
            totalPage: 1,   //总页数;
            defaultParam: {  //获取列表提交的参数;
                page: 1,
                size: 30
            },
            articleType: null,  //当前推文类型;
            privilege: null,  //当前用户的所有权限;
            priceChange: 'rise',  //价格变化 涨='rise' 跌='decline' 涨跌榜查询必须;
            AreaData: null   //当前地区;
        };
        this.getDataList = this.getDataList.bind(this);
        this.changePage = this.changePage.bind(this);
    }

    componentDidMount() {
        this.setState({articleType: this.props.todayArticleType[0]}, () => {
            this.getDataList();
        });

        //当前用户的所有权限获取;
        let tabData = this.props.currentTabData,
            userNavigate = this.props.userNavigate;
        if(this.props.userNavigate && this.props.userNavigate != '') {
            if(userNavigate[tabData.parentId] && userNavigate[tabData.parentId][tabData.id]){
                this.setState({privilege: this.props.userNavigate[tabData.parentId][tabData.id]});
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.AreaData != this.state.AreaData) {
            this.setState({
                AreaData: nextProps.AreaData,
                articleType: this.props.todayArticleType[0]
            }, () => {
                this.getDataList();
            });
        }
    }

    //获取数据列表;
    getDataList() {
        let server = H.server,
            param = {
                area_id: this.props.AreaData.area_id,
                article_type_id: this.state.articleType.id,
                price_change: this.state.priceChange,  //价格变化 涨='rise' 跌='decline' 涨跌榜查询必须
                page: this.state.defaultParam.page,
                size: this.state.defaultParam.size
            };
        server.operate_dailyNews_goods_list(param, (res) => {
            if(res.code == 0) {
                this.setState({
                    data: res.data.goods_info,
                    totalPage: Math.ceil(res.data.total/param.size)
                });
            }else if(res.code == 10106) {
                H.overdue();
            }else {
                H.Modal(res.message);
            }
        });
    }

    //对当前页面的设置;
    changePage(n) {
        let param = this.state.defaultParam,
            newParam = Object.assign(param, n);
        this.setState({defaultParam: newParam}, () => {
            this.getDataList();
        });
    }

    //判断是否有这个功能;
    isHavePrivilege(name) {
        let privilege = this.state.privilege;
        for (let i in privilege) {
            if(privilege[i].name == name) {
                return true;
            }
        }
        return false;
    }

    //切换推文类型查询对应列表;
    changeArticleType(data) {
        this.setState({
            articleType: data,
            defaultParam: {
                page: 1,
                size: 30
            }
        }, () => {
            this.getDataList();
        });
    }

    //商品列表中修改涨价降价;
    riseAndFall(str) {
        this.setState({priceChange: str}, () => {
            this.getDataList();
        });
    }

    //推文商品屏蔽操作;
    shielding(id, goodsId, status) {
        let param = {
            id: id,
            goods_id: goodsId,
            article_type_id: this.state.articleType.id,
            price_change: this.state.priceChange,
            shield_status: status
        };

        H.server.operate_dailyNews_goods_shield(param, (res) => {
            if(res.code == 0) {
                H.Modal('操作成功');
                this.getDataList();
            }else if(res.code == 10106) {
                H.overdue();
            }else {
                H.Modal(res.message);
            }
        });
    }

    //添加推荐商品;
    addRecommended() {
        let M = H.Modal({
            title: '新增推荐',
            content: '<p>商品ID：<input id="recommendedGid" type="text"></p>',
            cancel: true,
            okText: '保存',
            autoClose: false,
            cancelText: '取消',
            okCallback: () => {
                let param = {goods_id: $('#recommendedGid').val()};
                if(param.goods_id == '' || !param.goods_id) {
                    $('#recommendedGid')[0].focus();
                    return;
                }
                M.destroy();
                H.server.operate_dailyNews_goods_recommend(param, (res) => {
                    if(res.code == 0) {
                        H.Modal('成功添加');
                        this.getDataList();
                    }else if(res.code == 10106) {
                        H.overdue();
                    }else {
                        H.Modal(res.message);
                    }
                });
            },
            cancelCallback: () => {
                M.destroy();
            }
        });
    }

    //清空推荐列表;
    cleanRecommended() {
        H.Modal({
            title: '清空推荐',
            content: '<p>确认全部清空吗？</p>',
            cancel: true,
            okText: '确认',
            okCallback: () => {
                H.server.operate_dailyNews_recommend_goods_removeAll({}, (res) => {
                    if(res.code == 0) {
                        H.Modal('成功清除');
                        this.setState({
                            defaultParam: {
                                page: 1,
                                size: 30
                            }
                        }, () => {
                            this.getDataList();
                        });
                    }else if(res.code == 10106) {
                        H.overdue();
                    }else {
                        H.Modal(res.message);
                    }
                });
            }
        });

    }

    //移出推荐商品;
    removeRecommended(id, gid) {
        let param = {
            id: id
        };
        H.Modal({
            title: '移除推荐商品',
            height: '229',
            content: '<p>当前推荐ID：'+id+'</p><p>商品ID：'+gid+'</p><p>移出后，随时可以重新推荐</p>',
            ok: true,
            okText: '确认',
            okCallback: () => {
                H.server.operate_dailyNews_recommend_goods_remove(param, (res) => {
                    if(res.code == 0) {
                        H.Modal('成功移出');
                        this.getDataList();
                    }else if(res.code == 10106) {
                        H.overdue();
                    }else {
                        H.Modal(res.message);
                    }
                });
            }
        });
    }

    //推荐商品排序
    sortingRecommended(id, gid) {
        let M = H.Modal({
            title: '排序',
            height: '285',
            content: '<p>当前推荐ID：'+id+'</p><p>商品ID：'+gid+'</p><p>推荐ID：<input id="nextId" type="text"></p><p style="color:#888888;">排在谁上面就填谁的推荐ID，不能和当前推荐ID相同</p>',
            cancel: true,
            autoClose: false,
            okText: '保存',
            okCallback: () => {
                let param = {
                    current_id: id,
                    next_id: $('#nextId').val()
                };
                if(param.next_id == '' || !param.next_id || param.current_id == param.next_id) {
                    $('#nextId')[0].focus();
                    return;
                }
                M.destroy();
                H.server.operate_dailyNews_recommend_goods_sort(param, (res) => {
                    if(res.code == 0) {
                        H.Modal('成功排序');
                        this.getDataList();
                    }else if(res.code == 10106) {
                        H.overdue();
                    }else {
                        H.Modal(res.message);
                    }
                });
            },
            cancelCallback: () => {
                M.destroy();
            }
        });
    }

    render() {
        let tHead = (
            <tr>
                <th>序号</th>
                <th>商品ID</th>
                <th>品名</th>
                <th>昨日销量</th>
                <th>当前价格</th>
                <th>供应商</th>
                <th>操作</th>
            </tr>
        );
        if(this.state.articleType) {
            if(this.state.articleType.id == 4) {
                tHead = (
                    <tr>
                        <th>序号</th>
                        <th>商品ID</th>
                        <th>品名</th>
                        <th>昨日销量</th>
                        <th>当前价格</th>
                        <th>昨日价格</th>
                        <th>供应商</th>
                        <th>操作</th>
                    </tr>
                );
            }else if(this.state.articleType.id == 6) {
                tHead = (
                    <tr>
                        <th>序号</th>
                        <th>推荐ID</th>
                        <th>商品ID</th>
                        <th>品名</th>
                        <th>昨日销量</th>
                        <th>价格</th>
                        <th>供应商</th>
                        <th>操作</th>
                    </tr>
                );
            }
        }
        return (
            <div className="section-warp">
                <div className="section-filter">
                    <form className="form-inline">
                        <div className="filter-row">
                            <div className="btn-group">
                                {
                                    this.props.todayArticleType.map((data, index) => {
                                        return (
                                            <btn key={index}
                                                 className={data == this.state.articleType ? 'btn btn-sm btn-default' : 'btn btn-sm'}
                                                 onClick={this.changeArticleType.bind(this, data)}
                                            >{data.name}</btn>
                                        );
                                    })
                                }
                            </div>
                        </div>
                        {
                            this.state.articleType && this.state.articleType.id == 4 ?
                                <div className="filter-row">
                                    <div className="btn-group">
                                        <btn className={this.state.priceChange == 'rise' ? 'btn btn-sm btn-default' : 'btn btn-sm'} onClick={this.riseAndFall.bind(this, 'rise')}>涨价</btn>
                                        <btn className={this.state.priceChange == 'decline' ? 'btn btn-sm btn-default' : 'btn btn-sm'} onClick={this.riseAndFall.bind(this, 'decline')}>降价</btn>
                                    </div>
                                </div> : ''
                        }
                        {
                            this.state.articleType && this.state.articleType.id == 6 ?
                                <div className="filter-row">
                                    <div className="btn-group">
                                        <btn className='btn btn-sm' onClick={this.cleanRecommended.bind(this)}>清空</btn>
                                        <btn className='btn btn-lg' onClick={this.addRecommended.bind(this)}>新增推荐</btn>
                                    </div>
                                </div> : ''
                        }
                    </form>
                </div>
                <div className="section-table">
                    <table className="table table-bordered table-hover table-responsive">
                        <thead>
                        {tHead}
                        </thead>
                        <tbody>
                            {
                                this.state.data.map((data, index) => {
                                    if(this.state.articleType && this.state.articleType.id == 4) {
                                        return (
                                            <tr key={index}>
                                                <td>{data.id}</td>
                                                <td>{data.goods_id}</td>
                                                <td>{data.goods_name}</td>
                                                <td>{data.yesterday_sales_num}</td>
                                                <td>{data.goods_price}/件</td>
                                                <td>{data.yesterday_price}/件</td>
                                                <td>{data.sell_shop_name}</td>
                                                <td>
                                                    {data.shield_status == 1 ?
                                                        <a onClick={this.shielding.bind(this, data.id, data.goods_id, 2)}>本次屏蔽</a> :
                                                        <a onClick={this.shielding.bind(this, data.id, data.goods_id, 1)}>取消屏蔽</a>}
                                                </td>
                                            </tr>
                                        );
                                    }else if(this.state.articleType && this.state.articleType.id == 6){
                                        return (
                                            <tr key={index}>
                                                <td>{(this.state.defaultParam.page-1) * this.state.defaultParam.size + (index + 1)}</td>
                                                <td>{data.id}</td>
                                                <td>{data.goods_id}</td>
                                                <td>{data.goods_name}</td>
                                                <td>{data.yesterday_sales_num}</td>
                                                <td>{data.goods_price}/件</td>
                                                <td>{data.sell_shop_name}</td>
                                                <td>
                                                    <a onClick={this.removeRecommended.bind(this, data.id, data.goods_id)}>移出</a>
                                                    <a onClick={this.sortingRecommended.bind(this, data.id, data.goods_id)}>排序</a>
                                                </td>
                                            </tr>
                                        );
                                    }else {
                                        return (
                                            <tr key={index}>
                                                <td>{data.id}</td>
                                                <td>{data.goods_id}</td>
                                                <td>{data.goods_name}</td>
                                                <td>{data.yesterday_sales_num}</td>
                                                <td>{data.goods_price}/件</td>
                                                <td>{data.sell_shop_name}</td>
                                                <td>
                                                    {data.shield_status == 1 ?
                                                        <a onClick={this.shielding.bind(this, data.id, data.goods_id, 2)}>本次屏蔽</a> :
                                                        <a onClick={this.shielding.bind(this, data.id, data.goods_id, 1)}>取消屏蔽</a>}
                                                </td>
                                            </tr>
                                        );
                                    }
                                })
                            }
                        </tbody>
                    </table>
                    <PageCtrlBar pageNum={this.state.defaultParam.page}  maxPage={this.state.totalPage} clickCallback={this.changePage}/>
                </div>
            </div>
        );
    }
}

export default GoodsInfo;