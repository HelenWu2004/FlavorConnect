import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const RecipeForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/search', {
        query: values.searchQuery,
        number: 5
      });
      
      setRecipes(response.data.results);
    } catch (error) {
      message.error('Failed to fetch recipes. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatInstructions = (instructions) => {
    if (!instructions) return '';
    return instructions.split('\n').map((step, index) => (
      <p key={index}>{step}</p>
    ));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          name="searchQuery"
          rules={[{ required: true, message: 'Please enter your search query' }]}
        >
          <Input
            placeholder="Search for recipes..."
            prefix={<SearchOutlined />}
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Search Recipes
          </Button>
        </Form.Item>
      </Form>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
          {recipes.map((recipe, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                cover={
                  <img
                    alt={recipe.Title}
                    src={recipe.Image}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={recipe.Title}
                  description={
                    <div>
                      <h4>Ingredients:</h4>
                      <ul>
                        {recipe.Ingredients.map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                      </ul>
                      <h4>Instructions:</h4>
                      {recipe.InstructionsURL ? (
                        <a href={recipe.InstructionsURL} target="_blank" rel="noopener noreferrer">
                          View Instructions
                        </a>
                      ) : (
                        formatInstructions(recipe.Instructions)
                      )}
                      {recipe.relevance_score && (
                        <p>Relevance Score: {recipe.relevance_score.toFixed(2)}</p>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default RecipeForm; 