import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ConversationEvaluator = () => {
  const [conversations, setConversations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluations, setEvaluations] = useState({});
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError('');
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const uploadedConversations = JSON.parse(e.target.result);
          if (Array.isArray(uploadedConversations) && uploadedConversations.length > 0) {
            setConversations(uploadedConversations);
            setCurrentIndex(0);
            setEvaluations({});
            setShowResults(false);
          } else {
            throw new Error('Invalid JSON structure. Expected a non-empty array of conversations.');
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          setError('Error parsing JSON file. Please make sure it\'s a valid JSON array of conversations.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleEvaluation = (value) => {
    setEvaluations({ ...evaluations, [conversations[currentIndex].id]: value });
    if (currentIndex < conversations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const generateResults = () => {
    return JSON.stringify(evaluations, null, 2);
  };

  const copyResults = () => {
    const results = generateResults();
    navigator.clipboard.writeText(results).then(() => {
      alert('Results copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy results: ', err);
    });
  };

  if (conversations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Please upload a JSON file containing the conversations to evaluate.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="mb-2"
              />
              <Button onClick={() => document.querySelector('input[type="file"]').click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload Conversations
              </Button>
            </div>
            {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generateResults()}
              readOnly
              rows={10}
              className="mb-4"
            />
            <Button onClick={copyResults}>
              <Copy className="mr-2 h-4 w-4" /> Copy Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conversation = conversations[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Evaluate Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Prompt:</h3>
          <p className="mb-4">{conversation.prompt}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={() => handleEvaluation('in_topic')} variant="outline">Prompt In Topic</Button>
          <Button onClick={() => handleEvaluation('out_of_topic')} variant="outline">Prompt Out Of Topic</Button>
        </CardFooter>
      </Card>
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span>{currentIndex + 1} / {conversations.length}</span>
        <Button
          onClick={() => setCurrentIndex(Math.min(conversations.length - 1, currentIndex + 1))}
          disabled={currentIndex === conversations.length - 1}
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 text-center">
        <Button
          onClick={() => setShowResults(true)}
          disabled={Object.keys(evaluations).length !== conversations.length}
        >
          Show Results
        </Button>
      </div>
    </div>
  );
};

export default ConversationEvaluator;