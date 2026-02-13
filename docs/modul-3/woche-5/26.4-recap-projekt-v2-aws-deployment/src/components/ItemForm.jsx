// ===========================================================================
// ITEMFORM.JSX - Formular zum Hinzufügen neuer Items
// ===========================================================================

import { useState } from 'react';

function ItemForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === '') {
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');

    const newItem = {
      title: title.trim(),
      url: url.trim(),
      tags: tags
    };

    onAdd(newItem);

    setTitle('');
    setUrl('');
    setTagsInput('');
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <h2 className="item-form-title">Neues Item hinzufuegen</h2>

      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Titel <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          className="form-input"
          placeholder="z.B. React Dokumentation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="url" className="form-label">
          URL <span className="optional">(optional)</span>
        </label>
        <input
          type="url"
          id="url"
          className="form-input"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags" className="form-label">
          Tags <span className="optional">(optional, kommagetrennt)</span>
        </label>
        <input
          type="text"
          id="tags"
          className="form-input"
          placeholder="z.B. react, docs, learning"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      <button type="submit" className="submit-btn">
        Item hinzufuegen
      </button>
    </form>
  );
}

export default ItemForm;
