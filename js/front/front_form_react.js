
class FrontForm extends React.Component {
    
    /**
     * @constructor
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            frontName: '',
            frontType: 'fullscreen',
            frontManifest: false
        };

        if (this.props.useManifest) {
            this.state.frontManifest =  this.props.useManifest;
        }

        // Bind Event //
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e){
        if(e.target.name === 'frontManifest') {
            this.setState({[e.target.name]: e.target.checked});
        } else {
            this.setState({[e.target.name]: e.target.value});
        }
    }

    handleSubmit(e){
        var url = Routing.generate('app_front_create', {}, true);
        var promise = $.post(url, JSON.stringify({
            app_front_name: this.state.frontName,
            app_front_type: this.state.frontType,
            app_front_manifest: this.state.frontManifest
        }));

        promise
            .done(function (data) {
                window.location.replace(Routing.generate('app_front_list', {}, true));
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            })
        ;

        e.preventDefault();
    }

    /**
     * Render
     * @returns {XML}
     */
    render(){
        return (
            <form onSubmit={this.handleSubmit}>
                <ul className="nav navbar-nav col-md-5">
                    <li className="col-md-4">
                        <input key="frontName" name="frontName" placeholder="Nom du nouveau front" className="form-control"
                               value={this.state.frontName} onChange={this.handleChange} />
                    </li>
                    <li className="col-md-4">
                        <select key="frontType" name="frontType" value={this.state.frontType} onChange={this.handleChange} className="form-control"> 
                            <option value="fullscreen">Plein écran</option>
                            <option value="column">Volet</option>
                            <option value="banner">Bandeau</option>
                            <option value="special">Spécial</option>
                        </select>
                    </li>
                    <li className="checkbox col-md-3">
                        <label><input type="checkbox" name="frontManifest" checked={this.state.frontManifest} onChange={this.handleChange} /> Use Manifest</label>
                    </li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                    <li>
                        <button className="btn btn-default" onSubmit={this.onSubmit}>Valider</button>
                    </li>
                </ul>
            </form>       
        )
    }
}

window.FrontForm = FrontForm;
