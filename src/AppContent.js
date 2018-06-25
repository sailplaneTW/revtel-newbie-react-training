import React, { Component } from 'react';
import { getAppData } from './AppLogic';

export default class AppContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parkList: [],
            isFetching: true,

            filterInputs: ['', '', ''],
        };
    }

    componentDidMount() {
        getAppData().then(data => {
            this.setState({
                isFetching: false,
                parkList: data.result.results,
            });
        });
    }

    render() {
        let { isFetching, parkList, filterInputs, clickRecord } = this.state;

        return (
            <div>
            <h2>公園查詢系統</h2>
            <UserSearch
            onChange={filterInputs =>
                this.setState({ filterInputs: filterInputs })
            }
            />
            <ParkItems
            isFetching={isFetching}
            parkList={parkList}
            filterInputs={filterInputs}
            clickRecord={clickRecord}
            />
            </div>
        );
    }
}

class UserSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userInput1: '',
            userInput2: '',
            userInput3: '',
        };

        this.handleInputChange1 = this.handleInputChange1.bind(this);
        this.handleInputChange2 = this.handleInputChange2.bind(this);
        this.handleInputChange3 = this.handleInputChange3.bind(this);
    }

    render() {
        let { userInput1, userInput2, userInput3 } = this.state;

        return (
            <div
            style={{
                display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
            }}
            >
            <input
            style={styles.inputStyle}
            type="text"
            placeholder={'請輸入欲查詢公園名稱、公園景點'}
            value={userInput1}
            onChange={this.handleInputChange1}
            />
            <input
            style={styles.inputStyle}
            type="text"
            placeholder={'請輸入欲查詢公園介紹關鍵字'}
            value={userInput2}
            onChange={this.handleInputChange2}
            />
            <input
            style={styles.inputStyle}
            type="text"
            placeholder={'請輸入年份'}
            value={userInput3}
            onChange={this.handleInputChange3}
            />
            </div>
        );
    }

    handleInputChange1(evt) {
        this.setState({ userInput1: evt.target.value });

        if (this.props.onChange) {
            this.props.onChange([
                evt.target.value,
                this.state.userInput2,
                this.state.userInput3,
            ]);
        }
    }

    handleInputChange2(evt) {
        this.setState({ userInput2: evt.target.value });

        if (this.props.onChange) {
            this.props.onChange([
                this.state.userInput1,
                evt.target.value,
                this.state.userInput3,
            ]);
        }
    }

    handleInputChange3(evt) {
        this.setState({ userInput3: evt.target.value });

        if (this.props.onChange) {
            this.props.onChange([
                this.state.userInput1,
                this.state.userInput2,
                evt.target.value,
            ]);
        }
    }
}

const ParkItems = ({ isFetching, parkList, filterInputs }) => {
    if (isFetching) {
        return <div>Fetching ...</div>;
    }

    const hasSubString = (src, sub) => src.indexOf(sub) !== -1,
        [f1, f2] = filterInputs;

	/*
	let parkItems = parkList
		.filter(
			({ ParkName, Name }) =>
				hasSubString(ParkName, f1) || hasSubString(Name, f1)
		)
		.filter(({ Introduction }) => hasSubString(Introduction, f2))
		.map((parkData, idx) => <ParkItem parkData={parkData} key={idx} />);
		*/

	// ------------------------------------ //

	function filterLogic(parkList, filterInputs) {
		let ret = []

		function f1(list, text) {
			let r = []
			for (let i=0 ; i<list.length ; i++) {
				if (list[i].Name.indexOf(text) !== -1 || list[i].ParkName.indexOf(text) !== -1) {
					r.push(list[i])
				}
			}
			return r
		}

		function f2(list, text) {
			let r = []
			for (let i=0 ; i<list.length ; i++) {
				if (list[i].Introduction.indexOf(text) !== -1) {
					r.push(list[i])
				}
			}
			return r
		}

		function f3(list, text) {
			if (text === '') {
				return list
			}

			let r = []
			for (let i=0 ; i<list.length ; i++) {
				if (fYearBuilt(list[i], text)) {
					r.push(list[i])
				}
			}
			return r
		}

		console.log('................')
		function fYearBuilt(parkDetail, _yearBuilt) {
			let t = parkDetail.YearBuilt,
			yearBuilt = parseInt(_yearBuilt)

			// tranlate api park data YearBuilt to normal number (year)
			function translateAPIDateToNumber(text) {
				//console.log(`... '${text}', ${yearBuilt}`)

				// TODO
				if (text === '') {
					return -1
				} else {
					return parseInt(text.split('-')[0])
				}

			}

			let y = translateAPIDateToNumber(t)

			// compare(park data YearBuilt to normal number, yearBuilt)
			return y > yearBuilt
		}

        // parkList + filterInputs -> ret

		let ret1 = f1(parkList, filterInputs[0])
		let ret2 = f2(ret1, filterInputs[1])
		ret = f3(ret2, filterInputs[2])

        return ret

	}

	let listp = filterLogic(parkList, filterInputs)
	let parkItems = listp.map((parkData, idx) => <ParkItem parkData={parkData} key={idx} />)
	// ------------------------------------ //




	return (
        <div
        style={{
            display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
        }}
        >
        {parkItems}
        </div>
    );
};

class ParkItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isClicked: false,
        };
    }

    render() {
        let { isClicked } = this.state;
        let { parkData } = this.props;

        let myStyle = isClicked ? styles.parkItemLikedStyle : styles.parkItemStyle;
        return (
            <div
            style={myStyle}
            onClick={() => {
                this.setState({ isClicked: !isClicked });
            }}
            >
            {parkData.ParkName + ' : ' + parkData.Name + ` (${parkData.YearBuilt})`}
            <br />
            <br />
            {parkData.Introduction}
            </div>
        );
    }
}

const styles = {
    parkItemStyle: {
        backgroundColor: 'lightgrey',
        width: '45%',
        padding: 20,
        marginTop: 20,
        borderRadius: 20,
    },
    parkItemLikedStyle: {
        backgroundColor: '#FCF3CF',
        width: '45%',
        padding: 20,
        marginTop: 20,
        borderRadius: 20,
    },

    containerStyle: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    inputStyle: {
        width: '450px',
        hight: 250,
        marginTop: 10,
        fontSize: '12pt',

        textAlign: 'center',
    },
};
