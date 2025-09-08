import React, { useState, useReducer } from "react";
import Tesseract from "tesseract.js";
import topicImg from "./topic.png";
import "./addUnitTopics.css";

const AddUnitTopics = () => {
  const [listOfTopics, setListOfTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [text, setText] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const reFactorQuestions = (str) => {
    let res = [];
    str = str.split(" ");
    let questionMarksMapping = {
      "1.": 10,
      "2.": 10,
      "3.": 10,
      "4.": 5,
      "5.": 5,
      "6.": 5,
      "7.": 5,
      "8.": 5,
      "9.": 5,
      "10.": 5,
      "11.": 5,
      "12.": 5,
      "13.": 3,
      "14.": 3,
      "15.": 3,
      "16.": 3,
      "17.": 3,
      "18.": 3,
      "19.": 3,
      "20.": 3,
      "21.": 3,
      "22.": 3,
    };
    let marks = "";
    let qStr = "";
    for (let i = 0; i < str.length; i++) {
      if (questionMarksMapping[str[i]]) {
        marks = questionMarksMapping[str[i]];
        if (qStr !== "") {
          qStr += ` (marks: ${marks})`;
          res.push(qStr);
        }
        qStr = "";
        qStr = str[i];
      } else if (qStr !== "") {
        qStr += " " + str[i];
      }
    }
    if (res.length) {
      res.push(qStr + ` (marks: ${marks})`);
    }

    return res;
  };

  const reFactorTopics = (str) => {
    let res = [];
    str = str.split(",");
    if (str.length) {
      str.map((s) => {
        if (s !== "") {
          res.push(s);
        }
      });
    }
    return res;
  };

  const onChangeTopic = (e) => {
    let topicText = e.target.value;
    topicText = topicText.split(",");
    setTopic(topicText);
  };

  const onAddTopic = () => {
    if (topic !== "") {
      if (Array.isArray(topic)) {
        topic.forEach((t) => {
          if (t !== "") {
            listOfTopics.push(t);
          }
        });
      }
      setListOfTopics(listOfTopics);
      setTopic("");
      forceUpdate();
    }
  };

  const onClearTopic = () => {
    setListOfTopics([]);
    setTopic("");
  };

  const onClearImage = () => {
    setText("");
  };

  const fileUpload = async (event) => {
    const files = Array.from(event.target.files);
    // const file = event.target.files[0];
    if (!files.length) return;
    setLoadingQuestion(true);
    const res = [];

    try {
      for (const file of files) {
        const {
          data: { text },
        } = await Tesseract.recognize(file, "eng", {
          // logger: (m) => console.log(m), // progress updates
        });
        const regix =
          /(LONG ESSAYS \(Answer any One\) 1 x 10 = 10 Marks|SHORT ESSAYS \(Answer any Eight\) 8 x 5 = 40 Marks|SHORT ANSWERS 10 x 3 = 30 Marks|- ° =|>|<|\)|\(|&|=|S T|i 2)/g;
        let newStr = text.replace(regix, "").replace(/\s+/g, " ");
        newStr = reFactorQuestions(newStr);
        if (newStr.length) {
          res.push(...newStr);
        }
      }

      if (!res.length) {
        setOverlay({ id: "unittopics", visible: true });
        return;
      }
      setText(res);
    } catch (err) {
      setText("Error reading image.", err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const fileUploadTopics = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        // logger: (m) => console.log(m), // progress updates
      });
      let newStr = text
        .replace(/^\d+\.\s*|\[\d+\s*Hours\]|causes|effects|uses|reason/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      newStr = reFactorTopics(newStr);
      setListOfTopics(newStr);
    } catch (err) {
      setText("Error reading image.", err);
    } finally {
      setLoading(false);
    }
  };

  const populateUnitWiseQuestion = () => {
    if (listOfTopics.length === 0 || text.length === 0) {
      setOverlay(true);
      //alert("Please add topics and upload questions");
      return;
    }

    const lowerTopics = listOfTopics.map((t) => t.toLowerCase());

    const result = text.filter(
      (item) =>
        lowerTopics.filter((topic) =>
          item.toLowerCase().includes(topic.toLowerCase())
        ).length > 0
    );

    if (result.length) {
      setText(result);
    } else {
      let arr = ["No Unit wise Question found"];
      setText(arr);
    }
  };

  let list = null;
  if (listOfTopics.length) {
    list = listOfTopics.map((l, i) => {
      return (
        <div className="topicList" key={`list_${i}`}>
          {l}
        </div>
      );
    });
  }
  let processedText = null;
  if (text.length) {
    processedText = text.map((q, i) => {
      return (
        <div className="questionList" key={i}>
          {q}
        </div>
      );
    });
  }

  return (
    <div className="container">
      <div className="topicContainer">
        <h1 className="heading">Unit Wise Questions Generator</h1>
        <div className="createtopicContainer">
          <div className="topicButtonText">
            <label htmlFor="my-input" className="topicTitleText">
              Step1. Enter Topic or Multiple topic With Comma
            </label>
            <div className="right">
              <button type="submit" className="addTopic" onClick={onAddTopic}>
                Add Unit Topics
              </button>
              <button
                type="submit"
                className="clearTopic"
                onClick={onClearTopic}
              >
                Clear List Topics
              </button>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <textarea
              id="my-input"
              type="text"
              value={topic}
              className="topicTextBox"
              onChange={onChangeTopic}
            />
          </div>
        </div>

        <div className="unitTopic">
          <p className="glow-text">Or Upload A UnitWise Topics</p>
          <input
            type="file"
            id="my-input-upload"
            accept="image/*"
            onChange={fileUploadTopics}
            className="unitFileUpload"
          ></input>
          <div
            style={{ display: "flex", margin: "20px", flexDirection: "column" }}
          >
            <fieldset>
              <legend className="exmaplLegend">Example</legend>
              <img src={topicImg} className="imageExample"></img>
            </fieldset>
            <fieldset>
              <legend className="exmaplLegend">List of Topics</legend>
              <div className="listScroll">
                {loading && <p>Processing image ....</p>}
                {list ? list : "No Topic has been added"}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="populateContainer">
          <label htmlFor="my-input-u pload" className="uploadQuestionTitle">
            Step 2: Upload Your Questions(BPT)
          </label>
          <input
            type="file"
            id="my-input-upload"
            accept="image/*"
            onChange={fileUpload}
            className="uploadQuestion"
            multiple
          ></input>
          <button
            type="submit"
            className="populateButton"
            onClick={populateUnitWiseQuestion}
          >
            Find/Search Question Present in Unit
          </button>
          <button type="submit" className="clearImage" onClick={onClearImage}>
            Clear Question List
          </button>

          <div></div>

          <div className="questionsList">
            {loadingQuestion && <p>Processing image ....</p>}
            {processedText && <p>{processedText}</p>}
          </div>
        </div>
        {overlay && (
          <div
            className="overlay"
            onClick={() => setOverlay(false)} // close on overlay click
          >
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
            >
              <p style={{ fontSize: "19px" }}>
                {overlay.id === "unittopics"
                  ? "Please upload correct Questions format."
                  : "Please add topics and upload questions !"}
              </p>
              <button onClick={() => setOverlay(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUnitTopics;
